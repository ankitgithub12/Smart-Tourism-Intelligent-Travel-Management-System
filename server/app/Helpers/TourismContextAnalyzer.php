<?php

namespace App\Helpers;

class TourismContextAnalyzer
{
    /**
     * Extract tourism context from messages.
     * Returns: [destinations, trip_type, preferences, activities]
     */
    public static function extractContext(array $messages): array
    {
        $context = [
            'destinations' => [],
            'trip_type' => null,
            'preferences' => [],
            'activities' => [],
            'last_destination' => null,
        ];

        $allText = '';
        foreach ($messages as $msg) {
            if ($msg['role'] === 'user') {
                $allText .= ' ' . strtolower($msg['content']);
            }
        }

        // Extract destinations (Indian cities/places)
        $destinations = [
            'jaipur', 'taj mahal', 'agra', 'delhi', 'mumbai', 'bangalore', 'goa', 'kerala',
            'rajasthan', 'gushmere', 'shimla', 'manali', 'udaipur', 'varanasi', 'darjeeling',
            'himachal pradesh', 'uttarakhand', 'goa', 'sikkim', 'meghalaya', 'assam',
            'kerala', 'tamil nadu', 'karnataka', 'telangana', 'andhra pradesh', 'maharashtra',
            'jammu', 'kashmir', 'ladakh', 'pushkar', 'jodhpur', 'bikaner', 'mount abu',
            'amer fort', 'hawa mahal', 'agra fort', 'mehtab bagh', 'gate of india',
            'marinedrives', 'elephanta caves', 'varanasi ghats', 'backwaters', 'ooty',
        ];

        foreach ($destinations as $dest) {
            if (strpos($allText, $dest) !== false) {
                $context['destinations'][] = ucfirst($dest);
                $context['last_destination'] = ucfirst($dest);
            }
        }

        // Remove duplicates
        $context['destinations'] = array_unique($context['destinations']);

        // Extract trip types
        $tripTypes = [
            'adventure' => ['adventure', 'trek', 'hiking', 'climbing', 'extreme', 'adrenaline'],
            'heritage' => ['heritage', 'historical', 'monument', 'fort', 'palace', 'culture', 'ancient'],
            'beach' => ['beach', 'sea', 'coastal', 'island', 'water sports', 'swimming'],
            'food' => ['food', 'cuisine', 'restaurant', 'culinary', 'taste', 'eating', 'restaurant'],
            'relaxation' => ['relax', 'peaceful', 'spa', 'resort', 'quiet', 'calm', 'peace'],
            'family' => ['family', 'kids', 'children', 'couple', 'group'],
            'luxury' => ['luxury', 'premium', '5-star', 'high-end', 'exclusive'],
            'budget' => ['budget', 'cheap', 'affordable', 'backpack'],
        ];

        foreach ($tripTypes as $type => $keywords) {
            foreach ($keywords as $keyword) {
                if (strpos($allText, $keyword) !== false) {
                    $context['trip_type'] = $type;
                    break;
                }
            }
        }

        // Extract preferences
        $preferences = [
            'temple' => ['temple', 'spiritual', 'religious'],
            'photography' => ['photography', 'photo', 'pictures', 'scenic'],
            'nightlife' => ['nightlife', 'clubs', 'bars', 'parties'],
            'shopping' => ['shopping', 'market', 'mall', 'bazaar'],
            'nature' => ['nature', 'green', 'trees', 'wildlife', 'birds', 'animals'],
            'local_culture' => ['local', 'authentic', 'traditional', 'culture'],
        ];

        foreach ($preferences as $pref => $keywords) {
            foreach ($keywords as $keyword) {
                if (strpos($allText, $keyword) !== false) {
                    $context['preferences'][] = $pref;
                    break;
                }
            }
        }

        // Extract activities
        $activities = [
            'hot_air_balloon' => ['hot air balloon', 'balloon ride'],
            'trekking' => ['trek', 'hiking', 'trail'],
            'water_sports' => ['water sports', 'surfing', 'diving', 'snorkeling'],
            'wildlife_safari' => ['safari', 'wildlife'],
            'food_tour' => ['food tour', 'street food', 'culinary'],
            'temple_visit' => ['temple', 'temple visit'],
            'shopping' => ['shopping', 'market visit'],
        ];

        foreach ($activities as $activity => $keywords) {
            foreach ($keywords as $keyword) {
                if (strpos($allText, $keyword) !== false) {
                    $context['activities'][] = $activity;
                    break;
                }
            }
        }

        $context['activities'] = array_unique($context['activities']);
        $context['preferences'] = array_unique($context['preferences']);

        return $context;
    }

    /**
     * Generate destination-specific knowledge.
     */
    public static function getDestinationInfo(string $destination): array
    {
        $info = [
            'jaipur' => [
                'description' => 'The Pink City of India',
                'attractions' => ['Hawa Mahal', 'City Palace', 'Jantar Mantar', 'Amer Fort', 'Nahargarh Fort'],
                'activities' => ['Hot air balloon rides', 'ATV rides', 'Trekking at Nahargarh', 'Camel safari'],
                'food' => ['Dal Baati Churma', 'Ker Sangri', 'Gatte Ki Sabzi', 'Laal Maas'],
                'nearby' => ['Pushkar (150km)', 'Mount Abu (250km)', 'Udaipur (410km)'],
                'best_time' => 'October to March',
                'tips' => ['Visit Hawa Mahal at sunrise', 'Book Amer Fort tickets in advance', 'Stay hydrated in summers'],
            ],
            'taj mahal' => [
                'description' => 'World\'s most iconic monument in Agra',
                'attractions' => ['Taj Mahal', 'Agra Fort', 'Mehtab Bagh', 'Tomb of Itimad-ud-Daulah'],
                'activities' => ['Sunrise/Sunset viewing', 'Photography', 'Museum visits'],
                'food' => ['Petha', 'Mughlai cuisine', 'Local street food'],
                'nearby' => ['Mathura (60km)', 'Vrindavan (70km)', 'Fatehpur Sikri (38km)'],
                'best_time' => 'October to March (especially December-February)',
                'tips' => ['Visit at sunrise for fewer crowds', 'Book tickets 1 hour early', 'Bring good walking shoes'],
            ],
            'agra' => [
                'description' => 'City of monuments and love',
                'attractions' => ['Taj Mahal', 'Agra Fort', 'Mehtab Bagh', 'Fatehpur Sikri'],
                'activities' => ['Monument tours', 'Boat rides on Yamuna'],
                'food' => ['Mughlai dishes', 'Local sweets'],
                'nearby' => ['Taj Mahal', 'Mathura', 'Fatehpur Sikri'],
                'best_time' => 'November to February',
                'tips' => ['Get a professional guide', 'Stay near Taj Mahal for early access'],
            ],
            'delhi' => [
                'description' => 'Capital of India with ancient and modern blend',
                'attractions' => ['Red Fort', 'India Gate', 'Qutub Minar', 'Raj Ghat', 'Humayun\'s Tomb'],
                'activities' => ['Walking tours', 'Shopping at Chandni Chowk', 'Museum visits'],
                'food' => ['Delhi-style street food', 'Chaat', 'Kebabs'],
                'nearby' => ['Agra', 'Jaipur'],
                'best_time' => 'October to March',
                'tips' => ['Use metro for easy transport', 'Visit Red Fort early morning'],
            ],
            'goa' => [
                'description' => 'Beach paradise of India',
                'attractions' => ['Baga Beach', 'Calangute Beach', 'Fort Aguada', 'Church of St. Cajetan'],
                'activities' => ['Water sports', 'Beach parties', 'Backwater cruises', 'Dolphin spotting'],
                'food' => ['Fish curry rice', 'Goan cuisine', 'Seafood'],
                'nearby' => ['Hampi', 'Dudhsagar Falls'],
                'best_time' => 'November to February',
                'tips' => ['Book water sports in advance', 'Visit beaches in evening for sunset'],
            ],
            'kerala' => [
                'description' => 'God\'s own country with backwaters and beaches',
                'attractions' => ['Backwaters', 'Beaches', 'Tea plantations', 'Houseboat cruises'],
                'activities' => ['Houseboat cruises', 'Backwater tours', 'Beach relaxation', 'Ayurveda treatments'],
                'food' => ['Seafood', 'Appam', 'Sadya', 'Coconut curry'],
                'nearby' => ['Munnar', 'Thekkady', 'Alleppey'],
                'best_time' => 'October to March',
                'tips' => ['Book houseboat cruises in advance', 'Visit during monsoon for greenery'],
            ],
        ];

        $dest = strtolower($destination);
        return $info[$dest] ?? null;
    }

    /**
     * Check if context has changed significantly.
     */
    public static function hasContextChanged(array $oldContext, array $newContext): bool
    {
        return $oldContext['last_destination'] !== $newContext['last_destination'] ||
               $oldContext['trip_type'] !== $newContext['trip_type'];
    }
}
