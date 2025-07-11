<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'admin';
    case INSTRUCTOR = 'instructor';

    public function label(): string
    {
        return match($this) {
            self::ADMIN => 'Administrador',
            self::INSTRUCTOR => 'Instrutor',
        };
    }

    public static function toArray(): array
    {
        return [
            self::ADMIN->value => self::ADMIN->label(),
            self::INSTRUCTOR->value => self::INSTRUCTOR->label(),
        ];
    }
} 