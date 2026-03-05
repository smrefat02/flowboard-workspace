<?php

use App\Modules\Trello\Controllers\BoardController;
use App\Modules\Trello\Controllers\BoardMemberController;
use App\Modules\Trello\Controllers\AttachmentController;
use App\Modules\Trello\Controllers\CardCommentController;
use App\Modules\Trello\Controllers\CardController;
use App\Modules\Trello\Controllers\LabelController;
use App\Modules\Trello\Controllers\ListController;
use App\Modules\Trello\Controllers\WorkspaceController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/workspaces', [WorkspaceController::class, 'index']);
    Route::post('/workspaces', [WorkspaceController::class, 'store']);
    Route::get('/workspaces/{workspace}', [WorkspaceController::class, 'show']);
    Route::post('/workspaces/{workspace}/invite', [WorkspaceController::class, 'invite']);

    Route::get('/workspaces/{workspace}/boards', [BoardController::class, 'index']);
    Route::post('/boards', [BoardController::class, 'store']);
    Route::get('/boards/{board}', [BoardController::class, 'show']);
    Route::patch('/boards/{board}', [BoardController::class, 'update']);
    Route::delete('/boards/{board}', [BoardController::class, 'destroy']);
    Route::get('/boards/{board}/members', [BoardMemberController::class, 'index']);
    Route::post('/boards/{board}/members', [BoardMemberController::class, 'store']);
    Route::delete('/boards/{board}/members/{user}', [BoardMemberController::class, 'destroy']);

    Route::post('/boards/{board}/lists', [ListController::class, 'store']);
    Route::patch('/lists/{list}', [ListController::class, 'update']);
    Route::post('/boards/{board}/lists/reorder', [ListController::class, 'reorder']);
    Route::delete('/lists/{list}', [ListController::class, 'destroy']);

    Route::post('/lists/{list}/cards', [CardController::class, 'store']);
    Route::get('/cards/{card}', [CardController::class, 'show']);
    Route::patch('/cards/{card}', [CardController::class, 'update']);
    Route::post('/cards/reorder', [CardController::class, 'reorder']);
    Route::delete('/cards/{card}', [CardController::class, 'destroy']);

    Route::post('/cards/{card}/comments', [CardCommentController::class, 'store']);
    Route::delete('/cards/{card}/comments/{comment}', [CardCommentController::class, 'destroy']);

    Route::post('/boards/{board}/labels', [LabelController::class, 'store']);
    Route::patch('/labels/{label}', [LabelController::class, 'update']);
    Route::delete('/labels/{label}', [LabelController::class, 'destroy']);

    Route::post('/cards/{card}/attachments', [AttachmentController::class, 'store']);
    Route::delete('/attachments/{attachment}', [AttachmentController::class, 'destroy']);
});
