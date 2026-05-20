<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tourist_places', function (Blueprint $table) {
            $table->decimal('latitude', 10, 7)->nullable()->after('entry_fee');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
        });

        // Populate existing Jaipur coordinates
        $coordinates = [
            'City Palace' => [26.9258, 75.8237],
            'Amber Fort' => [26.9855, 75.8513],
            'Hawa Mahal' => [26.9239, 75.8267],
            'Nahargarh Fort' => [26.9374, 75.8156],
            'Jantar Mantar' => [26.9248, 75.8245],
            'Jal Mahal' => [26.9656, 75.8592],
            'Albert Hall Museum' => [26.9116, 75.8195],
            'Birla Mandir' => [26.8920, 75.8155],
            'Galtaji Temple' => [26.9168, 75.8584],
            'Sisodia Rani Garden' => [26.9015, 75.8753],
            'Jaigarh Fort' => [26.9429, 75.8456],
            'Johari Bazaar' => [26.9220, 75.8270]
        ];

        foreach ($coordinates as $name => $coords) {
            \Illuminate\Support\Facades\DB::table('tourist_places')
                ->where('name', $name)
                ->update([
                    'latitude' => $coords[0],
                    'longitude' => $coords[1],
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tourist_places', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude']);
        });
    }
};
