<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workspaces', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('owner_id');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('owner_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('workspace_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id');
            $table->uuid('user_id');
            $table->string('role', 20)->default('member');
            $table->timestamps();

            $table->unique(['workspace_id', 'user_id']);
            $table->index(['user_id', 'role']);
            $table->foreign('workspace_id')->references('id')->on('workspaces')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('boards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id');
            $table->uuid('created_by');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('visibility', 20)->default('workspace');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->index(['workspace_id', 'position']);
            $table->foreign('workspace_id')->references('id')->on('workspaces')->cascadeOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('board_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('board_id');
            $table->uuid('user_id');
            $table->string('role', 20)->default('member');
            $table->timestamps();

            $table->unique(['board_id', 'user_id']);
            $table->index(['user_id', 'role']);
            $table->foreign('board_id')->references('id')->on('boards')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('lists', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('board_id');
            $table->string('title');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->index(['board_id', 'position']);
            $table->foreign('board_id')->references('id')->on('boards')->cascadeOnDelete();
        });

        Schema::create('cards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('list_id');
            $table->uuid('creator_id');
            $table->string('title');
            $table->longText('description')->nullable();
            $table->timestamp('due_date')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->index(['list_id', 'position']);
            $table->index(['due_date']);
            $table->foreign('list_id')->references('id')->on('lists')->cascadeOnDelete();
            $table->foreign('creator_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('card_assignees', function (Blueprint $table) {
            $table->uuid('card_id');
            $table->uuid('user_id');
            $table->timestamps();

            $table->primary(['card_id', 'user_id']);
            $table->foreign('card_id')->references('id')->on('cards')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('card_labels', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('board_id');
            $table->string('name');
            $table->string('color', 20);
            $table->timestamps();

            $table->index(['board_id']);
            $table->foreign('board_id')->references('id')->on('boards')->cascadeOnDelete();
        });

        Schema::create('card_label_links', function (Blueprint $table) {
            $table->uuid('card_id');
            $table->uuid('card_label_id');
            $table->timestamps();

            $table->primary(['card_id', 'card_label_id']);
            $table->foreign('card_id')->references('id')->on('cards')->cascadeOnDelete();
            $table->foreign('card_label_id')->references('id')->on('card_labels')->cascadeOnDelete();
        });

        Schema::create('card_comments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('card_id');
            $table->uuid('user_id')->nullable();
            $table->longText('body');
            $table->timestamps();

            $table->index(['card_id', 'created_at']);
            $table->foreign('card_id')->references('id')->on('cards')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('card_attachments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('card_id');
            $table->uuid('uploaded_by')->nullable();
            $table->string('file_name');
            $table->string('file_path');
            $table->string('mime_type', 120);
            $table->unsignedBigInteger('size_bytes')->default(0);
            $table->timestamps();

            $table->index(['card_id']);
            $table->foreign('card_id')->references('id')->on('cards')->cascadeOnDelete();
            $table->foreign('uploaded_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('activities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('board_id');
            $table->uuid('card_id')->nullable();
            $table->uuid('user_id')->nullable();
            $table->string('action', 100);
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['board_id', 'created_at']);
            $table->index(['card_id', 'created_at']);
            $table->foreign('board_id')->references('id')->on('boards')->cascadeOnDelete();
            $table->foreign('card_id')->references('id')->on('cards')->nullOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activities');
        Schema::dropIfExists('card_attachments');
        Schema::dropIfExists('card_comments');
        Schema::dropIfExists('card_label_links');
        Schema::dropIfExists('card_labels');
        Schema::dropIfExists('card_assignees');
        Schema::dropIfExists('cards');
        Schema::dropIfExists('lists');
        Schema::dropIfExists('board_members');
        Schema::dropIfExists('boards');
        Schema::dropIfExists('workspace_members');
        Schema::dropIfExists('workspaces');
    }
};
