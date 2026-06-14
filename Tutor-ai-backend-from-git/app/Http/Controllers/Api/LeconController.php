<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ChapitreResource;
use App\Http\Resources\LeconResource;
use App\Models\Chapitre;
use App\Models\Lecon;
use Illuminate\Http\Request;

class LeconController extends Controller
{
    /**
     * Get all lessons for a specific chapter.
     */
    public function getLessonsByChapter($chapterId)
    {
        $lecons = Lecon::where('id_chapitre', $chapterId)
            ->with('chapitre.matiere')
            ->get();

        return LeconResource::collection($lecons);
    }

    /**
     * Get a specific lesson by ID.
     */
    public function show($id)
    {
        $lecon = Lecon::with(['chapitre.matiere'])->findOrFail($id);
        return new LeconResource($lecon);
    }

    /**
     * Get all chapters for a specific subject (matiere).
     */
    public function getChaptersBySubject($subjectId)
    {
        $chapitres = Chapitre::where('id_matiere', $subjectId)
            ->with(['matiere', 'lecons'])
            ->get();

        return ChapitreResource::collection($chapitres);
    }

    /**
     * Get a specific chapter by ID with its lessons.
     */
    public function getChapter($id)
    {
        $chapitre = Chapitre::with(['matiere', 'lecons'])->findOrFail($id);
        return new ChapitreResource($chapitre);
    }
}
