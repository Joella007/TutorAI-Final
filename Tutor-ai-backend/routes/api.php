<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Password;
use App\Models\User;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\MatiereController;
use App\Http\Controllers\Api\NiveauController;
use App\Http\Controllers\Api\CycleController;
use App\Http\Controllers\Api\CoursController;
use App\Http\Controllers\Api\LeconController;
use App\Http\Controllers\Api\StudentCoursesController;
use App\Http\Controllers\Api\ProgressionController;
use App\Http\Controllers\Api\AIChatController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\FiliereController;
use App\Http\Controllers\Api\CoursContentController;

/*
|--------------------------------------------------------------------------
| Routes publiques (Sans préfixe)
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/matieres', [MatiereController::class, 'index']);
Route::get('/matieres/disponibles', [MatiereController::class, 'disponibles']);
Route::get('/niveaux', [NiveauController::class, 'index']);
Route::get('/cycles', [CycleController::class, 'index']);
Route::get('/cours', [CoursController::class, 'index']);
Route::get('/cours/recommandes', [CoursController::class, 'recommandes']);
Route::get('/cours/par-niveau', [CoursController::class, 'parNiveau']);
Route::get('/cours/{id}', [CoursController::class, 'show']);
Route::get('/matieres/{id}/chapitres', [LeconController::class, 'getChaptersBySubject']);
Route::get('/chapitres/{id}', [LeconController::class, 'getChapter']);
Route::get('/chapitres/{id}/lecons', [LeconController::class, 'getLessonsByChapter']);
Route::get('/lecons/{id}', [LeconController::class, 'show']);
Route::get('/filieres', [FiliereController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Routes protégées (Sans préfixe)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return new \App\Http\Resources\UserResource(
            $request->user()->load(['role', 'niveau.cycle', 'filiere.niveau.cycle']) // ✅ charge aussi le cycle
        );
    });
    Route::get('/profile', [UserController::class, 'profile']);
    Route::post('/profile', [UserController::class, 'update']);
    Route::put('/user/password', [UserController::class, 'changePassword']);
    Route::get('/user/courses', [StudentCoursesController::class, 'index']);
    Route::get('/user/courses/{id}', [StudentCoursesController::class, 'show']);
    Route::post('/user/courses/{id}/enroll', [StudentCoursesController::class, 'enroll']);
    Route::post('/cours/{id}/generate-content', [CoursContentController::class, 'generateContent']);
    Route::get('/progression', [ProgressionController::class, 'index']);
    Route::get('/cours/{id}/progress', [ProgressionController::class, 'show']);
    Route::put('/cours/{id}/progress', [ProgressionController::class, 'update']);
    Route::post('/ai/chat', [AIChatController::class, 'chat']);
    Route::post('/ai/quiz', [QuizController::class, 'generateQuiz']);
    Route::post('/ai/quiz/score', [QuizController::class, 'saveScore']);//new route to save quiz score
    Route::get('/ai/chat/history', [AIChatController::class, 'history']);
    Route::delete('/ai/chat/history/{id}', [AIChatController::class, 'deleteHistory']);
});

/*
|--------------------------------------------------------------------------
| Préfixe v1
|--------------------------------------------------------------------------
*/
Route::prefix('v1')->group(function () {
    // 🟢 ROUTES PUBLIQUES (Pas besoin d'être connecté)
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    
    // Ajout de la route filieres dans les routes publiques de v1 ! ✅
    Route::get('/filieres', [FiliereController::class, 'index']); 
    
    Route::post('/forgot-password', function (Request $request) {
        $request->validate(['email' => 'required|email']);
        $status = Password::sendResetLink($request->only('email'));
        return $status === Password::RESET_LINK_SENT 
            ? response()->json(['message' => __($status)])
            : response()->json(['errors' => ['email' => [__($status)]]], 422);
    });

    Route::post('/reset-password', function (Request $request) {
        $request->validate([
            'token' => 'required', 'email' => 'required|email',
            'mot_de_passe' => 'required|min:8', 'mot_de_passe_confirmation' => 'required|same:mot_de_passe',
        ]);
        $status = Password::reset(
            ['email' => $request->email, 'token' => $request->token, 'password' => $request->mot_de_passe, 'password_confirmation' => $request->mot_de_passe_confirmation],
            function (User $user, string $password) {
                $user->forceFill(['mot_de_passe' => bcrypt($password)])->save();
                $user->tokens()->delete();
            }
        );
        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => __($status)])
            : response()->json(['errors' => ['email' => [__($status)]]], 422);
    });

    Route::get('/matieres', [MatiereController::class, 'index']);
    Route::get('/matieres/disponibles', [MatiereController::class, 'disponibles']);
    Route::get('/niveaux', [NiveauController::class, 'index']);
    Route::get('/cycles', [CycleController::class, 'index']);
    Route::get('/cours', [CoursController::class, 'index']);
    Route::get('/cours/recommandes', [CoursController::class, 'recommandes']);
    Route::get('/cours/par-niveau', [CoursController::class, 'parNiveau']);
    Route::get('/cours/{id}', [CoursController::class, 'show']);
    Route::get('/matieres/{id}/chapitres', [LeconController::class, 'getChaptersBySubject']);
    Route::get('/chapitres/{id}', [LeconController::class, 'getChapter']);
    Route::get('/chapitres/{id}/lecons', [LeconController::class, 'getLessonsByChapter']);
    Route::get('/lecons/{id}', [LeconController::class, 'show']);

    // 🔴 ROUTES PROTÉGÉES (L'utilisateur DOIT être connecté)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', function (Request $request) {
            return new \App\Http\Resources\UserResource($request->user()->load(['role', 'niveau.cycle', 'filiere.niveau.cycle']));
        });
        Route::get('/profile', [UserController::class, 'profile']);
        Route::post('/profile', [UserController::class, 'update']);
        Route::put('/user/password', [UserController::class, 'changePassword']);
        
        Route::get('/user/courses', [StudentCoursesController::class, 'index']);
        Route::get('/user/courses/{id}', [StudentCoursesController::class, 'show']);
        Route::post('/user/courses/{id}/enroll', [StudentCoursesController::class, 'enroll']);
        Route::post('/cours/{id}/generate-content', [CoursContentController::class, 'generateContent']);
        
        Route::get('/progression', [ProgressionController::class, 'index']);
        Route::get('/cours/{id}/progress', [ProgressionController::class, 'show']);
        Route::put('/cours/{id}/progress', [ProgressionController::class, 'update']);
        
        Route::post('/ai/chat', [AIChatController::class, 'chat']);
        Route::post('/ai/quiz', [QuizController::class, 'generateQuiz']);
        Route::post('/ai/quiz/score', [QuizController::class, 'saveScore']);//new route to save quiz score
        Route::get('/ai/chat/history', [AIChatController::class, 'history']);
        Route::delete('/ai/chat/history/{id}', [AIChatController::class, 'deleteHistory']);
    });
});