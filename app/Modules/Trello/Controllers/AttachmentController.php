<?php

namespace App\Modules\Trello\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Trello\Models\Card;
use App\Modules\Trello\Models\CardAttachment;
use App\Modules\Trello\Requests\StoreAttachmentRequest;
use App\Modules\Trello\Services\ActivityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    public function __construct(private readonly ActivityService $activities)
    {
    }

    public function store(StoreAttachmentRequest $request, Card $card): JsonResponse
    {
        $this->authorize('update', $card);

        $file = $request->file('file');
        $path = $file->store('trello/attachments', 'public');

        $attachment = $card->attachments()->create([
            'uploaded_by' => $request->user()->id,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
            'size_bytes' => $file->getSize(),
        ]);

        $this->activities->log($card->list->board, $card, (string) $request->user()->id, 'card.attachment.created', [
            'attachment_id' => $attachment->id,
            'file_name' => $attachment->file_name,
        ]);

        return response()->json(['data' => $attachment], 201);
    }

    public function destroy(CardAttachment $attachment): JsonResponse
    {
        $this->authorize('update', $attachment->card);

        $this->activities->log($attachment->card->list->board, $attachment->card, (string) request()->user()?->id, 'card.attachment.deleted', [
            'attachment_id' => $attachment->id,
            'file_name' => $attachment->file_name,
        ]);

        Storage::disk('public')->delete($attachment->file_path);
        $attachment->delete();

        return response()->json(['message' => 'Attachment deleted']);
    }
}
