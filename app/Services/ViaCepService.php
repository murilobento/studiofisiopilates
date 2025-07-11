<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class ViaCepService
{
    protected $baseUrl = 'https://viacep.com.br/ws/';

    public function buscarCep($cep)
    {
        $cep = preg_replace('/[^0-9]/', '', $cep);
        
        if (strlen($cep) !== 8) {
            return null;
        }

        try {
            $response = Http::get($this->baseUrl . $cep . '/json/');
            
            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['erro']) && $data['erro']) {
                    return null;
                }
                
                return [
                    'cep' => $data['cep'] ?? '',
                    'logradouro' => $data['logradouro'] ?? '',
                    'bairro' => $data['bairro'] ?? '',
                    'localidade' => $data['localidade'] ?? '',
                    'uf' => $data['uf'] ?? '',
                ];
            }
        } catch (\Exception $e) {
            return null;
        }

        return null;
    }
} 