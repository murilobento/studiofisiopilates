<?php

namespace App\Providers;

use App\Models\ClassModel;
use App\Models\Plan;
use App\Models\Student;
use App\Models\User;
use App\Policies\ClassPolicy;
use App\Policies\PlanPolicy;
use App\Policies\StudentPolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(ClassModel::class, ClassPolicy::class);
        Gate::policy(Student::class, StudentPolicy::class);
        Gate::policy(Plan::class, PlanPolicy::class);
        Gate::policy(User::class, UserPolicy::class);
    }
}
