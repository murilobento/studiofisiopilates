<?php

namespace App\Http\Controllers;

use App\Models\MonthlyPayment;
use App\Models\Student;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class PaymentController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = MonthlyPayment::with(['student', 'plan', 'instructor']);

        // Se for instrutor, mostrar apenas suas mensalidades
        if ($user->role->value === 'instructor') {
            $query->where('instructor_id', $user->id);
        }

        // Definir mês e ano atuais como padrão se não houver filtros específicos
        $currentMonth = now()->month;
        $currentYear = now()->year;
        
        // Verificar se há algum filtro aplicado
        $hasFilters = $request->filled('student_id') || 
                      $request->filled('instructor_id') || 
                      $request->filled('status') || 
                      $request->filled('month') || 
                      $request->filled('year') || 
                      $request->filled('payment_method') || 
                      $request->filled('due_date_from') || 
                      $request->filled('due_date_to');

        // Filtros
        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->filled('instructor_id') && $user->role->value === 'admin') {
            $query->where('instructor_id', $request->instructor_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('month') && $request->filled('year')) {
            $query->byMonth($request->month, $request->year);
        } elseif (!$hasFilters) {
            // Se não houver filtros, mostrar o mês vigente
            $query->byMonth($currentMonth, $currentYear);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->filled('due_date_from')) {
            $query->where('due_date', '>=', $request->due_date_from);
        }

        if ($request->filled('due_date_to')) {
            $query->where('due_date', '<=', $request->due_date_to);
        }

        $payments = $query->orderBy('due_date', 'desc')
                          ->paginate(15)
                          ->withQueryString();

        // Buscar dados para filtros
        $students = $user->role->value === 'admin' 
            ? Student::where('status', 'ativo')->get(['id', 'name'])
            : $user->students()->where('status', 'ativo')->get(['id', 'name']);

        $instructors = $user->role->value === 'admin' 
            ? \App\Models\User::canBeInstructors()->active()->get(['id', 'name'])
            : collect();

        // Estatísticas
        $stats = $this->paymentService->getDashboardStats();

        return Inertia::render('Payments/Index', [
            'payments' => $payments,
            'students' => $students,
            'instructors' => $instructors,
            'stats' => $stats,
            'filters' => $request->only(['student_id', 'instructor_id', 'status', 'month', 'year', 'payment_method', 'due_date_from', 'due_date_to']),
            'can' => [
                'create' => $user->role->value === 'admin',
                'processPayment' => true,
                'viewAll' => $user->role->value === 'admin',
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = Auth::user();
        
        $students = $user->role->value === 'admin' 
            ? Student::where('status', 'ativo')->with('plan')->get(['id', 'name', 'plan_id'])
            : $user->students()->where('status', 'ativo')->with('plan')->get(['id', 'name', 'plan_id']);

        return Inertia::render('Payments/Create', [
            'students' => $students,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'reference_month' => 'required|date_format:Y-m',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $student = Student::findOrFail($request->student_id);
        $referenceMonth = Carbon::createFromFormat('Y-m', $request->reference_month)->startOfMonth();

        // Verificar se já existe mensalidade para este período
        $existingPayment = MonthlyPayment::where('student_id', $student->id)
            ->where('reference_month', $referenceMonth->format('Y-m-01'))
            ->first();

        if ($existingPayment) {
            return back()->withErrors([
                'reference_month' => 'Já existe uma mensalidade para este aluno neste período.'
            ]);
        }

        MonthlyPayment::create([
            'student_id' => $student->id,
            'plan_id' => $student->plan_id,
            'instructor_id' => $student->instructor_id,
            'amount' => $request->amount,
            'original_amount' => $request->amount,
            'due_date' => $request->due_date,
            'reference_month' => $referenceMonth->format('Y-m-01'),
            'status' => 'pending',
            'notes' => $request->notes,
            'is_automatic' => false,
        ]);

        return redirect()->route('payments.index')
            ->with('success', 'Mensalidade criada com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(MonthlyPayment $payment)
    {
        $user = Auth::user();
        
        // Verificar permissões
        if ($user->role->value === 'instructor' && $payment->instructor_id !== $user->id) {
            abort(403, 'Você só pode visualizar mensalidades dos seus alunos.');
        }

        $payment->load(['student', 'plan', 'instructor', 'createdBy', 'updatedBy']);

        return Inertia::render('Payments/Show', [
            'payment' => $payment,
            'can' => [
                'processPayment' => $payment->status === 'pending' || $payment->status === 'overdue',
                'cancel' => $payment->status !== 'paid' && $user->role->value === 'admin',
                'edit' => $payment->status !== 'paid' && $user->role->value === 'admin',
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MonthlyPayment $payment)
    {
        $user = Auth::user();
        
        // Apenas admin pode editar
        if ($user->role->value !== 'admin') {
            abort(403, 'Apenas administradores podem editar mensalidades.');
        }

        // Não pode editar mensalidades pagas
        if ($payment->status === 'paid') {
            return back()->withErrors([
                'edit' => 'Não é possível editar mensalidades já pagas.'
            ]);
        }

        $payment->load(['student', 'plan', 'instructor']);

        return Inertia::render('Payments/Edit', [
            'payment' => $payment,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MonthlyPayment $payment)
    {
        $user = Auth::user();
        
        // Apenas admin pode editar
        if ($user->role->value !== 'admin') {
            abort(403, 'Apenas administradores podem editar mensalidades.');
        }

        // Não pode editar mensalidades pagas
        if ($payment->status === 'paid') {
            return back()->withErrors([
                'edit' => 'Não é possível editar mensalidades já pagas.'
            ]);
        }

        $request->validate([
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        $payment->update([
            'amount' => $request->amount,
            'due_date' => $request->due_date,
            'discount' => $request->discount ?? 0,
            'notes' => $request->notes,
        ]);

        return redirect()->route('payments.index')
            ->with('success', 'Mensalidade atualizada com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MonthlyPayment $payment)
    {
        $user = Auth::user();
        
        // Apenas admin pode excluir
        if ($user->role->value !== 'admin') {
            abort(403, 'Apenas administradores podem excluir mensalidades.');
        }

        // Não pode excluir mensalidades pagas
        if ($payment->status === 'paid') {
            return back()->withErrors([
                'delete' => 'Não é possível excluir mensalidades já pagas.'
            ]);
        }

        $payment->delete();

        return redirect()->route('payments.index')
            ->with('success', 'Mensalidade excluída com sucesso!');
    }

    /**
     * Processar pagamento de uma mensalidade
     */
    public function processPayment(Request $request, MonthlyPayment $payment)
    {
        $user = Auth::user();
        
        // Verificar permissões
        if ($user->role->value === 'instructor' && $payment->instructor_id !== $user->id) {
            abort(403, 'Você só pode processar pagamentos dos seus alunos.');
        }

        $request->validate([
            'payment_method' => 'required|in:cash,credit_card,debit_card,pix,bank_transfer,check',
            'notes' => 'nullable|string|max:1000',
            'receipt_number' => 'nullable|string|max:100',
        ]);

        try {
            $this->paymentService->processPayment(
                $payment,
                $request->payment_method,
                null, // amount_paid removido
                $request->notes,
                $request->receipt_number
            );

            return back()->with('success', 'Pagamento processado com sucesso!');
        } catch (\Exception $e) {
            return back()->withErrors([
                'payment' => $e->getMessage()
            ]);
        }
    }

    /**
     * Cancelar uma mensalidade
     */
    public function cancel(Request $request, MonthlyPayment $payment)
    {
        $user = Auth::user();
        
        // Apenas admin pode cancelar
        if ($user->role->value !== 'admin') {
            abort(403, 'Apenas administradores podem cancelar mensalidades.');
        }

        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $this->paymentService->cancelPayment($payment, $request->reason);

        return back()->with('success', 'Mensalidade cancelada com sucesso!');
    }
    
    /**
     * Desfazer um pagamento, retornando para o status pendente
     */
    public function undoPayment(Request $request, MonthlyPayment $payment)
    {
        $user = Auth::user();
        
        // Apenas admin pode desfazer pagamentos
        if ($user->role->value !== 'admin') {
            abort(403, 'Apenas administradores podem desfazer pagamentos.');
        }

        // Verificar se o pagamento está com status "pago"
        if ($payment->status !== 'paid') {
            return back()->withErrors([
                'undo' => 'Apenas pagamentos com status "pago" podem ser desfeitos.'
            ]);
        }

        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        try {
            $this->paymentService->undoPayment($payment, $request->reason);
            return back()->with('success', 'Pagamento desfeito com sucesso!');
        } catch (\Exception $e) {
            return back()->withErrors([
                'undo' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Estornar um cancelamento, retornando para o status pendente
     */
    public function undoCancel(Request $request, MonthlyPayment $payment)
    {
        $user = Auth::user();
        
        // Apenas admin pode estornar cancelamentos
        if ($user->role->value !== 'admin') {
            abort(403, 'Apenas administradores podem estornar cancelamentos.');
        }

        // Verificar se o pagamento está com status "cancelado"
        if ($payment->status !== 'cancelled') {
            return back()->withErrors([
                'undoCancel' => 'Apenas mensalidades com status "cancelado" podem ser estornadas.'
            ]);
        }

        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        try {
            $this->paymentService->undoCancel($payment, $request->reason);
            return back()->with('success', 'Cancelamento estornado com sucesso!');
        } catch (\Exception $e) {
            return back()->withErrors([
                'undoCancel' => $e->getMessage()
            ]);
        }
    }

    /**
     * Gerar mensalidades para um período
     */
    /**
     * Show form to generate monthly payments
     */
    public function generateForm()
    {
        $user = Auth::user();
        
        // Apenas admin pode gerar mensalidades
        if ($user->role->value !== 'admin') {
            abort(403, 'Apenas administradores podem gerar mensalidades.');
        }

        return Inertia::render('Payments/Generate');
    }

    /**
     * Check if payments already exist for the given period
     */
    public function checkGeneration(Request $request)
    {
        $user = Auth::user();
        
        // Apenas admin pode gerar mensalidades
        if ($user->role->value !== 'admin') {
            abort(403, 'Apenas administradores podem gerar mensalidades.');
        }

        $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2030',
        ]);

        // Verificar se é o mês vigente
        $currentMonth = now()->month;
        $currentYear = now()->year;
        
        if ($request->month != $currentMonth || $request->year != $currentYear) {
            return back()->withErrors([
                'month' => 'Apenas o mês vigente pode ser selecionado para geração de mensalidades.'
            ]);
        }

        $result = $this->paymentService->checkExistingPayments(
            $request->month,
            $request->year
        );

        // Retornar para a página de geração com os dados
        return redirect()->route('payments.generate')->with('check_result', $result);
    }

    public function generate(Request $request)
    {
        $user = Auth::user();
        
        // Apenas admin pode gerar mensalidades
        if ($user->role->value !== 'admin') {
            abort(403, 'Apenas administradores podem gerar mensalidades.');
        }

        $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2030',
        ]);

        // Verificar se é o mês vigente
        $currentMonth = now()->month;
        $currentYear = now()->year;
        
        if ($request->month != $currentMonth || $request->year != $currentYear) {
            return back()->withErrors([
                'month' => 'Apenas o mês vigente pode ser selecionado para geração de mensalidades.'
            ]);
        }

        try {
            $result = $this->paymentService->generateMonthlyPayments(
                $request->month,
                $request->year
            );

            $created = $result['created']->count();
            $alreadyExists = $result['already_exists'];
            $totalStudents = $result['total_students'];

            $message = '';
            if ($created > 0 && $alreadyExists > 0) {
                $message = "{$created} mensalidade(s) gerada(s). {$alreadyExists} já existiam para este período.";
            } elseif ($created > 0) {
                $message = "{$created} mensalidade(s) gerada(s) com sucesso!";
            } else {
                $message = "Nenhuma mensalidade foi gerada. Todas já existem para este período.";
            }

            return redirect()->route('payments.index')->with([
                'success' => $message,
                'created' => $created,
                'already_exists' => $alreadyExists,
                'total_students' => $totalStudents,
            ]);
        } catch (\Exception $e) {
            return back()->withErrors([
                'generate' => $e->getMessage()
            ]);
        }
    }

    /**
     * Relatório de pagamentos
     */
    public function report(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);

        $report = $this->paymentService->generatePaymentReport($startDate, $endDate);

        return Inertia::render('Payments/Report', [
            'report' => $report,
            'filters' => $request->only(['start_date', 'end_date']),
        ]);
    }
}
