<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Trello\Resources\UserTinyResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserSearchController extends Controller
{
    public function __invoke(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:100'],
        ]);

        $term = '%' . $request->string('q')->toString() . '%';

        $users = User::query()
            ->where(function ($query) use ($term): void {
                $query->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term);
            })
            ->where('id', '!=', $request->user()->id)
            ->select(['id', 'name', 'email'])
            ->limit(15)
            ->get();

        return UserTinyResource::collection($users);
    }
}
