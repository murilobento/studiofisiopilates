<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanController extends Controller
{
    public function index()
    {
        $plans = Plan::all();
        return Inertia::render('Plans/Index', [
            'plans' => $plans,
        ]);
    }

    public function create()
    {
        return Inertia::render('Plans/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'description' => 'required|string|max:255',
            'frequency' => 'required|integer',
            'price' => 'required|numeric',
        ]);

        Plan::create($request->all());

        return redirect()->route('plans.index')->with('success', 'Plano criado com sucesso!');
    }

    public function edit(Plan $plan)
    {
        return Inertia::render('Plans/Edit', [
            'plan' => $plan,
        ]);
    }

    public function update(Request $request, Plan $plan)
    {
        $request->validate([
            'description' => 'required|string|max:255',
            'frequency' => 'required|integer',
            'price' => 'required|numeric',
        ]);

        $plan->update($request->all());

        return redirect()->route('plans.index')->with('success', 'Plano atualizado com sucesso!');
    }

    public function destroy(Plan $plan)
    {
        $plan->delete();

        return redirect()->route('plans.index')->with('success', 'Plano excluído com sucesso!');
    }
}
