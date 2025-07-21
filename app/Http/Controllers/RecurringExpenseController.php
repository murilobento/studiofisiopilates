<?php

namespace App\Http\Controllers;

use App\Models\RecurringExpense;
use App\Services\ExpenseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class RecurringExpenseController extends Controller
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
     * Exibe a lista de despesas recorrentes.
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // Obtém os filtros da requisição
        $filters = [
            'is_active' => $request->input('is_active', true),
            'type' => $request->input('type'),
            'category' => $request->input('category'),
        ];

        // Busca as despesas recorrentes com os filtros aplicados
        $expenses = $this->expenseService->searchRecurringExpenses($filters);

        // Obtém as categorias únicas para o filtro
        $categories = RecurringExpense::select('category')->distinct()->pluck('category');

        return Inertia::render('Financial/RecurringExpenses/Index', [
            'expenses' => $expenses,
            'filters' => $filters,
            'categories' => $categories,
        ]);
    }

    /**
     * Exibe o formulário para criar uma nova despesa recorrente.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        // Obtém as categorias existentes para sugestão
        $categories = RecurringExpense::select('category')->distinct()->pluck('category');

        return Inertia::render('Financial/RecurringExpenses/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Armazena uma nova despesa recorrente.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        // Validação dos dados
        $validator = Validator::make($request->all(), RecurringExpense::validationRules());

        // Validação adicional para despesas de valor fixo
        if ($request->input('type') === 'fixed') {
            $validator->addRules(RecurringExpense::fixedExpenseRules());
        }

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        // Cria a despesa recorrente
        $expense = $this->expenseService->createRecurringExpense($request->all());

        return redirect()->route('recurring-expenses.index')
            ->with('success', 'Despesa recorrente criada com sucesso.');
    }

    /**
     * Exibe os detalhes de uma despesa recorrente.
     *
     * @param RecurringExpense $recurringExpense
     * @return \Inertia\Response
     */
    public function show(RecurringExpense $recurringExpense)
    {
        // Carrega o relacionamento com o criador
        $recurringExpense->load('creator');

        // Busca as transações relacionadas a esta despesa
        $transactions = \App\Models\FinancialTransaction::where('reference_id', $recurringExpense->id)
            ->where('reference_type', get_class($recurringExpense))
            ->orderBy('transaction_date', 'desc')
            ->get();

        return Inertia::render('Financial/RecurringExpenses/Show', [
            'expense' => $recurringExpense,
            'transactions' => $transactions,
        ]);
    }

    /**
     * Exibe o formulário para editar uma despesa recorrente.
     *
     * @param RecurringExpense $recurringExpense
     * @return \Inertia\Response
     */
    public function edit(RecurringExpense $recurringExpense)
    {
        // Obtém as categorias existentes para sugestão
        $categories = RecurringExpense::select('category')->distinct()->pluck('category');

        return Inertia::render('Financial/RecurringExpenses/Edit', [
            'expense' => $recurringExpense,
            'categories' => $categories,
        ]);
    }

    /**
     * Atualiza uma despesa recorrente.
     *
     * @param Request $request
     * @param RecurringExpense $recurringExpense
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, RecurringExpense $recurringExpense)
    {
        // Validação dos dados
        $validator = Validator::make($request->all(), RecurringExpense::validationRules());

        // Validação adicional para despesas de valor fixo
        if ($request->input('type') === 'fixed') {
            $validator->addRules(RecurringExpense::fixedExpenseRules());
        }

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        // Atualiza a despesa recorrente
        $this->expenseService->updateRecurringExpense($recurringExpense, $request->all());

        return redirect()->route('recurring-expenses.index')
            ->with('success', 'Despesa recorrente atualizada com sucesso.');
    }

    /**
     * Remove uma despesa recorrente.
     *
     * @param RecurringExpense $recurringExpense
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(RecurringExpense $recurringExpense)
    {
        // Desativa a despesa em vez de excluí-la
        $recurringExpense->update(['is_active' => false]);

        return redirect()->route('recurring-expenses.index')
            ->with('success', 'Despesa recorrente desativada com sucesso.');
    }

    /**
     * Registra um pagamento para uma despesa recorrente variável.
     *
     * @param Request $request
     * @param RecurringExpense $recurringExpense
     * @return \Illuminate\Http\RedirectResponse
     */
    public function registerPayment(Request $request, RecurringExpense $recurringExpense)
    {
        // Validação dos dados
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0',
            'date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        // Registra o pagamento
        $date = $request->input('date') ? \Carbon\Carbon::parse($request->input('date')) : null;
        $this->expenseService->registerRecurringExpensePayment(
            $recurringExpense,
            $request->input('amount'),
            $date
        );

        return redirect()->route('recurring-expenses.show', $recurringExpense)
            ->with('success', 'Pagamento registrado com sucesso.');
    }

    /**
     * Exibe as despesas com vencimento próximo.
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function upcoming(Request $request)
    {
        $days = $request->input('days', 7);
        $expenses = $this->expenseService->checkUpcomingExpenses($days);

        return Inertia::render('Financial/RecurringExpenses/Upcoming', [
            'expenses' => $expenses,
            'days' => $days,
        ]);
    }
}
