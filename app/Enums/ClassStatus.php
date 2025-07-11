<?php

namespace App\Enums;

enum ClassStatus: string
{
    case SCHEDULED = 'scheduled';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::SCHEDULED => 'Agendada',
            self::COMPLETED => 'Concluída',
            self::CANCELLED => 'Cancelada',
        };
    }

    public static function toArray(): array
    {
        return [
            self::SCHEDULED->value => self::SCHEDULED->label(),
            self::COMPLETED->value => self::COMPLETED->label(),
            self::CANCELLED->value => self::CANCELLED->label(),
        ];
    }
} 