<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Collection;

class PendingCommissionsNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Comissões pendentes.
     *
     * @var Collection
     */
    protected $commissions;

    /**
     * Valor total das comissões pendentes.
     *
     * @var float
     */
    protected $totalAmount;

    /**
     * Create a new notification instance.
     *
     * @param Collection $commissions
     * @param float $totalAmount
     */
    public function __construct(Collection $commissions, float $totalAmount)
    {
        $this->commissions = $commissions;
        $this->totalAmount = $totalAmount;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $formattedAmount = 'R$ ' . number_format($this->totalAmount, 2, ',', '.');
        $count = $this->commissions->count();
        
        $message = (new MailMessage)
            ->subject("Comissões Pendentes: {$count} comissões aguardando pagamento")
            ->greeting('Olá!')
            ->line("Existem **{$count} comissões pendentes** aguardando pagamento.")
            ->line("Valor total: **{$formattedAmount}**");
            
        // Adiciona detalhes das comissões (limitado a 5 para não sobrecarregar o email)
        $message->line('### Detalhes das comissões:');
        
        $this->commissions->take(5)->each(function ($commission) use (&$message) {
            $instructorName = $commission->instructor->name;
            $studentName = $commission->monthly_payment->student->name;
            $amount = 'R$ ' . number_format($commission->commission_amount, 2, ',', '.');
            $date = date('d/m/Y', strtotime($commission->created_at));
            
            $message->line("- **{$instructorName}**: {$amount} (Aluno: {$studentName}, Data: {$date})");
        });
        
        if ($count > 5) {
            $message->line("... e mais " . ($count - 5) . " comissões.");
        }
        
        $message->action('Ver Comissões', url(route('commissions.index')))
            ->line('Obrigado por utilizar nosso sistema!');
            
        return $message;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'pending_commissions',
            'count' => $this->commissions->count(),
            'total_amount' => $this->totalAmount,
            'formatted_amount' => 'R$ ' . number_format($this->totalAmount, 2, ',', '.'),
            'url' => route('commissions.index'),
        ];
    }
}
