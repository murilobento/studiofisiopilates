<?php

namespace App\Notifications;

use App\Models\RecurringExpense;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ExpenseDueNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * A despesa recorrente que está próxima do vencimento.
     *
     * @var \App\Models\RecurringExpense
     */
    protected $expense;

    /**
     * Número de dias até o vencimento.
     *
     * @var int
     */
    protected $daysUntilDue;

    /**
     * Create a new notification instance.
     *
     * @param \App\Models\RecurringExpense $expense
     * @param int $daysUntilDue
     */
    public function __construct(RecurringExpense $expense, int $daysUntilDue)
    {
        $this->expense = $expense;
        $this->daysUntilDue = $daysUntilDue;
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
        $urgencyLevel = $this->daysUntilDue === 0 ? 'alta' : ($this->daysUntilDue <= 2 ? 'média' : 'baixa');
        $subject = $this->daysUntilDue === 0 
            ? "Despesa vence hoje: {$this->expense->name}" 
            : "Despesa próxima do vencimento: {$this->expense->name}";
        
        $message = (new MailMessage)
            ->subject($subject)
            ->greeting('Olá!')
            ->line("Esta é uma notificação sobre uma despesa recorrente que está próxima do vencimento.");
            
        if ($this->daysUntilDue === 0) {
            $message->line("A despesa **{$this->expense->name}** vence **hoje**.");
        } else {
            $message->line("A despesa **{$this->expense->name}** vence em **{$this->daysUntilDue} dias**.");
        }
        
        if ($this->expense->amount) {
            $formattedAmount = 'R$ ' . number_format($this->expense->amount, 2, ',', '.');
            $message->line("Valor: **{$formattedAmount}**");
        } else {
            $message->line("Esta é uma despesa de valor variável.");
        }
        
        $message->line("Categoria: {$this->expense->category}")
            ->line("Prioridade: {$urgencyLevel}")
            ->action('Ver Despesa', url(route('recurring-expenses.show', $this->expense->id)))
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
        $formattedAmount = $this->expense->amount 
            ? 'R$ ' . number_format($this->expense->amount, 2, ',', '.') 
            : 'Valor variável';
            
        return [
            'id' => $this->expense->id,
            'type' => 'expense_due',
            'name' => $this->expense->name,
            'amount' => $formattedAmount,
            'category' => $this->expense->category,
            'due_day' => $this->expense->due_day,
            'days_until_due' => $this->daysUntilDue,
            'url' => route('recurring-expenses.show', $this->expense->id),
        ];
    }
}
