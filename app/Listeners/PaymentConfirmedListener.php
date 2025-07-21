<?php

namespace App\Listeners;

use App\Events\PaymentConfirmed;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class PaymentConfirmedListener
{
    protected $commissionService;
    protected $financialService;

    /**
     * Create the event listener.
     *
     * @param \App\Services\CommissionService $commissionService
     * @param \App\Services\FinancialService $financialService
     */
    public function __construct(
        \App\Services\CommissionService $commissionService,
        \App\Services\FinancialService $financialService
    ) {
        $this->commissionService = $commissionService;
        $this->financialService = $financialService;
    }

    /**
     * Handle the event.
     */
    public function handle(PaymentConfirmed $event): void
    {
        $payment = $event->payment;
        
        // Registra a transação financeira
        $this->financialService->recordPaymentTransaction($payment);
        
        // Calcula a comissão
        $commission = $this->commissionService->calculateCommission($payment);
        
        // Registra no log
        \Illuminate\Support\Facades\Log::info('Pagamento confirmado e processado', [
            'payment_id' => $payment->id,
            'student' => $payment->student->name,
            'amount' => $payment->amount,
            'commission_id' => $commission ? $commission->id : null,
        ]);
    }
}
