<?php

namespace App\Http\Controllers;

use App\Models\CommissionEntry;
use App\Models\User;
use App\Services\CommissionService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class CommissionController extends Controller
{
    protected $commissionService;

    /**
     * Construtor do controller.
     *
     * @param CommissionService $commissionService
     */
    public function __construct(CommissionService $commissionService)
    {
        $this->commissionService = $commissionService;
        $this->middleware('auth');
    }

    /**
     * Exibe a lista de comissões.
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // Obtém os filtros da requisição
        $filters = [
            'instructor_id' => $request->input('instructor_id'),
            'status' => $request->input('status'),
            'month' => $request->input('month'),
            'year' => $request->input('year'),
        ];

        // Se não houver mês e ano definidos, usa o mês atual
        if (!isset($filters['month']) || !isset($filters['year'])) {
            $filters['month'] = now()->month;
            $filters['year'] = now()->year;
        }

        // Busca as comissões com os filtros aplicados
        $commissions = $this->commissionService->searchCommissions($filters);

        // Obtém a lista de instrutores para o filtro
        $instructors = User::instructors()->active()->get(['id', 'name']);

        return Inertia::render('Financial/Commissions/Index', [
            'commissions' => $commissions,
            'filters' => $filters,
            'instructors' => $instructors,
        ]);
    }

    /**
     * Exibe os detalhes de uma comissão.
     *
     * @param CommissionEntry $commission
     * @return \Inertia\Response
     */
    public function show(CommissionEntry $commission)
    {
        // Carrega os relacionamentos
        $commission->load(['instructor', 'monthlyPayment.student']);

        return Inertia::render('Financial/Commissions/Show', [
            'commission' => $commission,
        ]);
    }

    /**
     * Processa o pagamento de uma comissão.
     *
     * @param Request $request
     * @param CommissionEntry $commission
     * @return \Illuminate\Http\RedirectResponse
     */
    public function processPayment(Request $request, CommissionEntry $commission)
    {
        // Verifica se a comissão já está paga
        if ($commission->status === 'paid') {
            return redirect()->back()->with('error', 'Esta comissão já foi paga.');
        }

        // Processa o pagamento
        $result = $this->commissionService->processCommissionPayment($commission);

        if ($result) {
            return redirect()->route('commissions.index')
                ->with('success', 'Pagamento de comissão processado com sucesso.');
        } else {
            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao processar o pagamento da comissão.');
        }
    }

    /**
     * Processa o pagamento em lote de comissões.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function processBatchPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'commission_ids' => 'required|array',
            'commission_ids.*' => 'exists:commission_entries,id',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator);
        }

        $result = $this->commissionService->processBatchPayment($request->input('commission_ids'));

        return redirect()->route('commissions.index')
            ->with('success', "Processamento em lote concluído: {$result['processed']} comissões pagas, {$result['failed']} falhas.");
    }

    /**
     * Exibe o relatório de comissões.
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function report(Request $request)
    {
        $startDate = $request->input('start_date')
            ? Carbon::parse($request->input('start_date'))
            : Carbon::now()->startOfMonth();

        $endDate = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))
            : Carbon::now()->endOfMonth();

        $report = $this->commissionService->generateCommissionReport($startDate, $endDate);

        return Inertia::render('Financial/Commissions/Report', [
            'report' => $report,
            'startDate' => $startDate->format('Y-m-d'),
            'endDate' => $endDate->format('Y-m-d'),
        ]);
    }

    /**
     * Calcula comissões pendentes para pagamentos confirmados.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function calculatePending(Request $request)
    {
        $startDate = $request->input('start_date')
            ? Carbon::parse($request->input('start_date'))
            : null;

        $endDate = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))
            : null;

        $result = $this->commissionService->calculatePendingCommissions($startDate, $endDate);

        return redirect()->route('commissions.index')
            ->with('success', "Cálculo de comissões concluído: {$result['processed']} comissões calculadas, {$result['failed']} falhas.");
    }

    /**
     * Exibe o dashboard de comissões.
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function dashboard(Request $request)
    {
        $instructorId = $request->input('instructor_id');
        $stats = $this->commissionService->getDashboardStats($instructorId);

        // Obtém a lista de instrutores para o filtro
        $instructors = User::instructors()->active()->get(['id', 'name']);

        return Inertia::render('Financial/Commissions/Dashboard', [
            'stats' => $stats,
            'instructors' => $instructors,
            'selectedInstructor' => $instructorId,
        ]);
    }
}
