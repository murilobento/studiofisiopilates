<?php

namespace App\Http\Controllers;

use App\Models\FinancialTransaction;
use App\Services\FinancialService;
use App\Services\CommissionService;
use App\Services\ExpenseService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class FinancialController extends Controller
{
    protected $financialService;
    protected $commissionService;
    protected $expenseService;

    /**
     * Construtor do controller.
     *
     * @param FinancialService $financialService
     * @param CommissionService $commissionService
     * @param ExpenseService $expenseService
     */
    public function __construct(
        FinancialService $financialService,
        CommissionService $commissionService,
        ExpenseService $expenseService
    ) {
        $this->financialService = $financialService;
        $this->commissionService = $commissionService;
        $this->expenseService = $expenseService;
        $this->middleware('auth');
    }

    /**
     * Exibe o dashboard financeiro.
     *
     * @return \Inertia\Response
     */
    public function dashboard()
    {
        $dashboardData = $this->financialService->getDashboardData();
        
        return Inertia::render('Financial/Dashboard', [
            'dashboardData' => $dashboardData,
        ]);
    }

    /**
     * Exibe a lista de transações financeiras.
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function transactions(Request $request)
    {
        // Obtém os filtros da requisição
        $filters = [
            'type' => $request->input('type'),
            'category' => $request->input('category'),
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'min_amount' => $request->input('min_amount'),
            'max_amount' => $request->input('max_amount'),
        ];

        // Se não houver datas definidas, usa o mês atual
        if (!isset($filters['start_date']) || !isset($filters['end_date'])) {
            $filters['start_date'] = now()->startOfMonth()->format('Y-m-d');
            $filters['end_date'] = now()->endOfMonth()->format('Y-m-d');
        }

        // Busca as transações com os filtros aplicados
        $query = FinancialTransaction::with('creator');
        
        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        
        if (isset($filters['category'])) {
            $query->where('category', $filters['category']);
        }
        
        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->whereBetween('transaction_date', [$filters['start_date'], $filters['end_date']]);
        }
        
        if (isset($filters['min_amount'])) {
            $query->where('amount', '>=', $filters['min_amount']);
        }
        
        if (isset($filters['max_amount'])) {
            $query->where('amount', '<=', $filters['max_amount']);
        }
        
        $transactions = $query->orderBy('transaction_date', 'desc')->paginate(20);

        // Obtém as categorias únicas para o filtro
        $categories = FinancialTransaction::select('category')->distinct()->pluck('category');

        return Inertia::render('Financial/Transactions', [
            'transactions' => $transactions,
            'filters' => $filters,
            'categories' => $categories,
            'types' => ['income', 'expense', 'commission'],
        ]);
    }

    /**
     * Exibe o relatório financeiro.
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

        $report = $this->financialService->generateFinancialReport($startDate, $endDate);
        $indicators = $this->financialService->calculateFinancialIndicators($startDate, $endDate);

        return Inertia::render('Financial/Report', [
            'report' => $report,
            'indicators' => $indicators,
            'startDate' => $startDate->format('Y-m-d'),
            'endDate' => $endDate->format('Y-m-d'),
        ]);
    }

    /**
     * Exporta o relatório financeiro para PDF.
     *
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\RedirectResponse
     */
    public function exportPdf(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator);
        }

        $startDate = Carbon::parse($request->input('start_date'));
        $endDate = Carbon::parse($request->input('end_date'));

        $pdfPath = $this->financialService->exportReportToPdf($startDate, $endDate);

        // Como é apenas um exemplo, retornamos uma mensagem
        return redirect()->back()->with('success', 'Relatório PDF gerado com sucesso.');
    }

    /**
     * Exporta o relatório financeiro para Excel.
     *
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\RedirectResponse
     */
    public function exportExcel(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator);
        }

        $startDate = Carbon::parse($request->input('start_date'));
        $endDate = Carbon::parse($request->input('end_date'));

        $excelPath = $this->financialService->exportReportToExcel($startDate, $endDate);

        // Como é apenas um exemplo, retornamos uma mensagem
        return redirect()->back()->with('success', 'Relatório Excel gerado com sucesso.');
    }

    /**
     * Exibe o relatório de fluxo de caixa.
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function cashFlow(Request $request)
    {
        $startDate = $request->input('start_date')
            ? Carbon::parse($request->input('start_date'))
            : Carbon::now()->startOfMonth();

        $endDate = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))
            : Carbon::now()->endOfMonth();

        // Busca todas as transações no período
        $transactions = FinancialTransaction::whereBetween('transaction_date', [$startDate, $endDate])
            ->orderBy('transaction_date')
            ->get();

        // Agrupa por dia
        $dailyData = [];
        $currentDate = $startDate->copy();
        
        while ($currentDate <= $endDate) {
            $dateKey = $currentDate->format('Y-m-d');
            $dayTransactions = $transactions->filter(function ($transaction) use ($dateKey) {
                return $transaction->transaction_date->format('Y-m-d') === $dateKey;
            });
            
            $income = $dayTransactions->where('type', 'income')->sum('amount');
            $expenses = $dayTransactions->where('type', 'expense')->sum('amount');
            $commissions = $dayTransactions->where('type', 'commission')->sum('amount');
            $balance = $income - $expenses - $commissions;
            
            $dailyData[] = [
                'date' => $dateKey,
                'income' => $income,
                'expenses' => $expenses,
                'commissions' => $commissions,
                'balance' => $balance,
                'transactions' => $dayTransactions,
            ];
            
            $currentDate->addDay();
        }

        return Inertia::render('Financial/CashFlow', [
            'dailyData' => $dailyData,
            'startDate' => $startDate->format('Y-m-d'),
            'endDate' => $endDate->format('Y-m-d'),
            'totalIncome' => $transactions->where('type', 'income')->sum('amount'),
            'totalExpenses' => $transactions->where('type', 'expense')->sum('amount'),
            'totalCommissions' => $transactions->where('type', 'commission')->sum('amount'),
            'totalBalance' => $transactions->where('type', 'income')->sum('amount') - 
                             $transactions->where('type', 'expense')->sum('amount') - 
                             $transactions->where('type', 'commission')->sum('amount'),
        ]);
    }

    /**
     * Exibe o relatório de projeção financeira.
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function projection(Request $request)
    {
        $months = $request->input('months', 6);
        $startDate = Carbon::now()->startOfMonth();
        $endDate = Carbon::now()->addMonths($months)->endOfMonth();

        // Busca dados históricos para projeção
        $historicalData = $this->getHistoricalData();

        // Calcula projeção baseada em dados históricos
        $projectionData = $this->calculateProjection($historicalData, $months);

        return Inertia::render('Financial/Projection', [
            'historicalData' => $historicalData,
            'projectionData' => $projectionData,
            'months' => $months,
        ]);
    }

    /**
     * Obtém dados históricos para projeção.
     *
     * @return array
     */
    private function getHistoricalData(): array
    {
        // Busca dados dos últimos 6 meses
        $endDate = Carbon::now()->endOfMonth();
        $startDate = Carbon::now()->subMonths(6)->startOfMonth();

        $transactions = FinancialTransaction::whereBetween('transaction_date', [$startDate, $endDate])
            ->get();

        $monthlyData = [];
        $currentDate = $startDate->copy();
        
        while ($currentDate <= $endDate) {
            $monthKey = $currentDate->format('Y-m');
            $monthTransactions = $transactions->filter(function ($transaction) use ($currentDate) {
                return $transaction->transaction_date->format('Y-m') === $currentDate->format('Y-m');
            });
            
            $income = $monthTransactions->where('type', 'income')->sum('amount');
            $expenses = $monthTransactions->where('type', 'expense')->sum('amount');
            $commissions = $monthTransactions->where('type', 'commission')->sum('amount');
            $profit = $income - $expenses - $commissions;
            
            $monthlyData[] = [
                'month' => $currentDate->format('m/Y'),
                'income' => $income,
                'expenses' => $expenses,
                'commissions' => $commissions,
                'profit' => $profit,
            ];
            
            $currentDate->addMonth();
        }

        return $monthlyData;
    }

    /**
     * Calcula projeção financeira.
     *
     * @param array $historicalData
     * @param int $months
     * @return array
     */
    private function calculateProjection(array $historicalData, int $months): array
    {
        // Calcula médias dos dados históricos
        $avgIncome = collect($historicalData)->avg('income');
        $avgExpenses = collect($historicalData)->avg('expenses');
        $avgCommissions = collect($historicalData)->avg('commissions');

        // Calcula tendência (crescimento/decrescimento)
        $incomeTrend = $this->calculateTrend($historicalData, 'income');
        $expensesTrend = $this->calculateTrend($historicalData, 'expenses');
        $commissionsTrend = $this->calculateTrend($historicalData, 'commissions');

        // Gera projeção
        $projectionData = [];
        $startDate = Carbon::now()->addMonth()->startOfMonth();
        
        for ($i = 0; $i < $months; $i++) {
            $projectedIncome = $avgIncome * (1 + $incomeTrend * ($i + 1) / 100);
            $projectedExpenses = $avgExpenses * (1 + $expensesTrend * ($i + 1) / 100);
            $projectedCommissions = $avgCommissions * (1 + $commissionsTrend * ($i + 1) / 100);
            $projectedProfit = $projectedIncome - $projectedExpenses - $projectedCommissions;
            
            $projectionData[] = [
                'month' => $startDate->copy()->addMonths($i)->format('m/Y'),
                'income' => $projectedIncome,
                'expenses' => $projectedExpenses,
                'commissions' => $projectedCommissions,
                'profit' => $projectedProfit,
            ];
        }

        return $projectionData;
    }

    /**
     * Calcula tendência de crescimento/decrescimento.
     *
     * @param array $data
     * @param string $field
     * @return float
     */
    private function calculateTrend(array $data, string $field): float
    {
        if (count($data) < 2) {
            return 0;
        }

        $first = $data[0][$field];
        $last = $data[count($data) - 1][$field];

        if ($first == 0) {
            return $last > 0 ? 5 : 0; // Assume 5% de crescimento se começar de zero
        }

        $change = (($last - $first) / $first) * 100;
        $monthlyChange = $change / (count($data) - 1);

        // Limita a tendência entre -10% e 10% por mês
        return max(-10, min(10, $monthlyChange));
    }
}
