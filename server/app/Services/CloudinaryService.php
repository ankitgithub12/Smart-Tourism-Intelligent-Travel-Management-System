<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CloudinaryService
{
    protected string $cloudName;
    protected string $apiKey;
    protected string $apiSecret;
    protected string $uploadUrl;

    public function __construct()
    {
        $this->cloudName = env('CLOUDINARY_CLOUD_NAME', '');
        $this->apiKey    = env('CLOUDINARY_API_KEY', '');
        $this->apiSecret = env('CLOUDINARY_API_SECRET', '');
        $this->uploadUrl = "https://api.cloudinary.com/v1_1/{$this->cloudName}/image/upload";
    }

    /**
     * Upload an image file to Cloudinary.
     *
     * @param  UploadedFile  $file
     * @param  string  $folder  Cloudinary folder name
     * @return array|null  ['url' => ..., 'public_id' => ...]
     */
    public function upload(UploadedFile $file, string $folder = 'smart-tourism'): ?array
    {
        if (empty($this->cloudName) || empty($this->apiKey)) {
            Log::warning('Cloudinary credentials not configured.');
            return null;
        }

        try {
            $timestamp = time();
            $params    = "folder={$folder}&timestamp={$timestamp}";
            $signature = sha1("{$params}{$this->apiSecret}");

            $response = Http::attach(
                'file',
                fopen($file->getRealPath(), 'r'),
                $file->getClientOriginalName()
            )->post($this->uploadUrl, [
                'api_key'   => $this->apiKey,
                'timestamp' => $timestamp,
                'signature' => $signature,
                'folder'    => $folder,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'url'       => $data['secure_url'],
                    'public_id' => $data['public_id'],
                    'width'     => $data['width'] ?? null,
                    'height'    => $data['height'] ?? null,
                ];
            }

            Log::error('Cloudinary upload failed: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('Cloudinary upload exception: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Delete an image from Cloudinary by public_id.
     */
    public function delete(string $publicId): bool
    {
        if (empty($this->cloudName)) {
            return false;
        }

        try {
            $timestamp = time();
            $params    = "public_id={$publicId}&timestamp={$timestamp}";
            $signature = sha1("{$params}{$this->apiSecret}");

            $response = Http::post(
                "https://api.cloudinary.com/v1_1/{$this->cloudName}/image/destroy",
                [
                    'public_id' => $publicId,
                    'api_key'   => $this->apiKey,
                    'timestamp' => $timestamp,
                    'signature' => $signature,
                ]
            );

            return $response->successful() && ($response->json()['result'] ?? '') === 'ok';
        } catch (\Exception $e) {
            Log::error('Cloudinary delete exception: ' . $e->getMessage());
            return false;
        }
    }
}
