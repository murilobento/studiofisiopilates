<?php

namespace App\Http\Controllers;

use App\Models\OccasionalExpense;
use App\Services\ExpenseService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class OccasionalExpenseController extends Controller
{
    protected $expenseService;

    /**
     * Construtor do controller.
     *
     * @param ExpenseService $expenseService
     */
    public function __construct(ExpenseService $expenseService)
    {
        $this->expenseService = $expenseService;
        $this->middleware('auth');
    }

    /**
     * Exibe a lista de despesas ocasionais.
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // Obtém os filtros da requisição
        $filters = [
            'category' => $request->input('category'),
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'min_amount' => $request->input('min_amount'),
            'max_amount' => $request->input('max_amount'),
            'has_receipt' => $request->input('has_receipt'),
        ];

        // Se não houver datas definidas, usa o mês atual
        if (!isset($filters['start_date']) || !isset($filters['end_date'])) {
            $filters['start_date'] = now()->startOfMonth()->format('Y-m-d');
            $filters['end_date'] = now()->endOfMonth()->format('Y-m-d');
        }

        // Busca as despesas ocasionais com os filtros aplicados
        $expenses = $this->expenseService->searchOccasionalExpenses($filters);

        // Obtém as categorias únicas para o filtro
        $categories = OccasionalExpense::select('category')->distinct()->pluck('category');

        return Inertia::render('Financial/OccasionalExpenses/Index', [
            'expenses' => $expenses,
            'filters' => $filters,
            'categories' => $categories,
        ]);
    }

    /**
     * Exibe o formulário para criar uma nova despesa ocasional.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        // Obtém as categorias existentes para sugestão
        $categories = OccasionalExpense::select('category')->distinct()->pluck('category');

        return Inertia::render('Financial/OccasionalExpenses/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Armazena uma nova despesa ocasional.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        // Validação dos dados
        $validator = Validator::make($request->all(), OccasionalExpense::validationRules());

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        // Obtém o arquivo de comprovante, se existir
        $receipt = $request->hasFile('receipt') ? $request->file('receipt') : null;

        // Cria a despesa ocasional
        $expense = $this->expenseService->createOccasionalExpense($request->all(), $receipt);

        return redirect()->route('occasional-expenses.index')
            ->with('success', 'Despesa ocasional criada com sucesso.');
    }

    /**
     * Exibe os detalhes de uma despesa ocasional.
     *
     * @param OccasionalExpense $occasionalExpense
     * @return \Inertia\Response
     */
    public function show(OccasionalExpense $occasionalExpense)
    {
        // Carrega o relacionamento com o criador
        $occasionalExpense->load('creator');

        // Verifica se a despesa tem comprovante
        $hasReceipt = $occasionalExpense->hasReceipt();
        $receiptUrl = $hasReceipt ? $occasionalExpense->getReceiptUrl() : null;

        return Inertia::render('Financial/OccasionalExpenses/Show', [
            'expense' => $occasionalExpense,
            'hasReceipt' => $hasReceipt,
            'receiptUrl' => $receiptUrl,
        ]);
    }

    /**
     * Exibe o formulário para editar uma despesa ocasional.
     *
     * @param OccasionalExpense $occasionalExpense
     * @return \Inertia\Response
     */
    public function edit(OccasionalExpense $occasionalExpense)
    {
        // Obtém as categorias existentes para sugestão
        $categories = OccasionalExpense::select('category')->distinct()->pluck('category');

        // Verifica se a despesa tem comprovante
        $hasReceipt = $occasionalExpense->hasReceipt();

        return Inertia::render('Financial/OccasionalExpenses/Edit', [
            'expense' => $occasionalExpense,
            'categories' => $categories,
            'hasReceipt' => $hasReceipt,
        ]);
    }

    /**
     * Atualiza uma despesa ocasional.
     *
     * @param Request $request
     * @param OccasionalExpense $occasionalExpense
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, OccasionalExpense $occasionalExpense)
    {
        // Validação dos dados
        $validator = Validator::make($request->all(), OccasionalExpense::validationRules());

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        // Obtém o arquivo de comprovante, se existir
        $receipt = $request->hasFile('receipt') ? $request->file('receipt') : null;

        // Atualiza a despesa ocasional
        $this->expenseService->updateOccasionalExpense($occasionalExpense, $request->all(), $receipt);

        return redirect()->route('occasional-expenses.index')
            ->with('success', 'Despesa ocasional atualizada com sucesso.');
    }

    /**
     * Remove uma despesa ocasional.
     *
     * @param OccasionalExpense $occasionalExpense
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(OccasionalExpense $occasionalExpense)
    {
        $result = $this->expenseService->deleteOccasionalExpense($occasionalExpense);

        if ($result) {
            return redirect()->route('occasional-expenses.index')
                ->with('success', 'Despesa ocasional excluída com sucesso.');
        } else {
            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao excluir a despesa ocasional.');
        }
    }

    /**
     * Faz o download do comprovante de uma despesa.
     *
     * @param OccasionalExpense $occasionalExpense
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\RedirectResponse
     */
    public function downloadReceipt(OccasionalExpense $occasionalExpense)
    {
        if (!$occasionalExpense->hasReceipt()) {
            return redirect()->back()->with('error', 'Esta despesa não possui comprovante.');
        }

        return response()->download(storage_path('app/private/' . $occasionalExpense->receipt_path));
    }

    /**
     * Remove o comprovante de uma despesa.
     *
     * @param OccasionalExpense $occasionalExpense
     * @return \Illuminate\Http\RedirectResponse
     */
    public function removeReceipt(OccasionalExpense $occasionalExpense)
    {
        if (!$occasionalExpense->hasReceipt()) {
            return redirect()->back()->with('error', 'Esta despesa não possui comprovante.');
        }

        $result = $occasionalExpense->removeReceipt();

        if ($result) {
            return redirect()->back()->with('success', 'Comprovante removido com sucesso.');
        } else {
            return redirect()->back()->with('error', 'Ocorreu um erro ao remover o comprovante.');
        }
    }

    /**
     * Exibe o relatório de despesas ocasionais por categoria.
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

        $expenses = OccasionalExpense::whereBetween('expense_date', [$startDate, $endDate])->get();

        // Agrupa por categoria
        $byCategory = $expenses->groupBy('category')->map(function ($items, $category) {
            return [
                'category' => $category,
                'total' => $items->sum('amount'),
                'count' => $items->count(),
                'items' => $items,
            ];
        })->values();

        return Inertia::render('Financial/OccasionalExpenses/Report', [
            'expenses' => $expenses,
            'byCategory' => $byCategory,
            'startDate' => $startDate->format('Y-m-d'),
            'endDate' => $endDate->format('Y-m-d'),
            'total' => $expenses->sum('amount'),
        ]);
    }
}
