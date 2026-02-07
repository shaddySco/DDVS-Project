<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NewsController extends Controller
{
    public function index()
    {
        $news = \App\Models\News::with('author')
            ->where('is_published', true)
            ->latest()
            ->paginate(5);
        return response()->json($news);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image_url' => 'nullable|string',
            'is_published' => 'boolean',
        ]);

        $news = \App\Models\News::create([
            ...$validated,
            'author_id' => auth()->id(),
        ]);

        return response()->json($news, 201);
    }

    public function show($id)
    {
        $news = \App\Models\News::with('author')->findOrFail($id);
        return response()->json($news);
    }

    public function update(Request $request, $id)
    {
        $news = \App\Models\News::findOrFail($id);

        // Ensure user is authorized (simple check, or use Policy)
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'string|max:255',
            'content' => 'string',
            'image_url' => 'nullable|string',
            'is_published' => 'boolean',
        ]);

        $news->update($validated);

        return response()->json($news);
    }

    public function destroy($id)
    {
        $news = \App\Models\News::findOrFail($id);
        
        if (auth()->user()->role !== 'admin') {
             return response()->json(['message' => 'Unauthorized'], 403);
        }

        $news->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
