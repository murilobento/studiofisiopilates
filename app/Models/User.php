<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'cpf',
        'phone',
        'commission_rate',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'commission_rate' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    // Scopes
    public function scopeInstructors($query)
    {
        return $query->where('role', UserRole::INSTRUCTOR);
    }

    public function scopeAdmins($query)
    {
        return $query->where('role', UserRole::ADMIN);
    }

    public function scopeCanBeInstructors($query)
    {
        return $query->whereIn('role', [UserRole::ADMIN, UserRole::INSTRUCTOR]);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Relationships
    public function classes(): HasMany
    {
        return $this->hasMany(ClassModel::class, 'instructor_id');
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'instructor_id');
    }

    public function monthlyPayments(): HasMany
    {
        return $this->hasMany(MonthlyPayment::class, 'instructor_id');
    }

    public function currentMonthPayments(): HasMany
    {
        return $this->hasMany(MonthlyPayment::class, 'instructor_id')
                    ->whereMonth('reference_month', now()->month)
                    ->whereYear('reference_month', now()->year);
    }

    // Helper methods
    public function isAdmin(): bool
    {
        return $this->role === UserRole::ADMIN;
    }

    public function isInstructor(): bool
    {
        return $this->role === UserRole::INSTRUCTOR;
    }
}
