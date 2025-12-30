<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'repository_link' => 'required|url|max:255',
            'category' => 'required|string|max:100',
            'image_path' => 'nullable|string|max:255',
        ];
    }
}
