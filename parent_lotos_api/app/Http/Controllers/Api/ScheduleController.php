<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Exceptions\Yclients\ClientNotFoundException;
use App\Exceptions\YclientsApiException;
use App\Services\Yclients\YclientsClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    protected YclientsClient $yclients;

    public function __construct(YclientsClient $yclients)
    {
        $this->yclients = $yclients;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user instanceof \App\Models\ParentProfile) {
            try {
                // Get schedule for all children (next 30 days)
                $from = Carbon::now();
                $to = Carbon::now()->addDays(30);
                
                $records = $this->yclients->getRecords(
                    $user->yclients_client_id,
                    $from,
                    $to
                );
                
                return response()->json($records);
            } catch (YclientsApiException $e) {
                return response()->json([
                    'message' => 'Error fetching schedule from YCLIENTS'
                ], 502);
            }
        }
        
        return response()->json([]);
    }

    public function forChild(Request $request, string $childId)
    {
        $user = $request->user();
        
        // Verify child belongs to user
        $child = $user->children()->where('yclients_visitor_id', $childId)->first();
        
        if (!$child) {
            return response()->json([
                'message' => 'Child not found or access denied'
            ], 403);
        }
        
        try {
            // Get schedule for specific child (next 30 days)
            $from = Carbon::now();
            $to = Carbon::now()->addDays(30);
            
            $records = $this->yclients->getRecords(
                $user->yclients_client_id,
                $from,
                $to
            );
            
            // Filter records for this child (assuming records have visitor/client info)
            // This would need adjustment based on actual YCLIENTS API response structure
            $childRecords = array_filter($records, function($record) use ($childId) {
                // Adjust based on actual YCLIENTS API response structure
                return isset($record['visitor_id']) && $record['visitor_id'] == $childId;
            });
            
            return response()->json(array_values($childRecords));
        } catch (YclientsApiException $e) {
            return response()->json([
                'message' => 'Error fetching schedule from YCLIENTS'
            ], 502);
        }
    }

    public function attendance(Request $request)
    {
        $user = $request->user();
        
        if ($user instanceof \App\Models\ParentProfile) {
            try {
                // Get attendance statistics
                // This would typically come from a separate endpoint or calculated from records
                $from = Carbon::now()->subMonth(1); // Last month
                $to = Carbon::now();
                
                $records = $this->yclients->getRecords(
                    $user->yclients_client_id,
                    $from,
                    $to
                );
                
                // Calculate attendance stats (simplified)
                $totalRecords = count($records);
                $attendedRecords = count(array_filter($records, function($record) {
                    // Adjust based on actual YCLIENTS API response structure
                    return isset($record['status']) && in_array($record['status'], ['attended', 'completed']);
                }));
                
                $attendanceRate = $totalRecords > 0 ? ($attendedRecords / $totalRecords) * 100 : 0;
                
                return response()->json([
                    'total_records' => $totalRecords,
                    'attended_records' => $attendedRecords,
                    'attendance_rate' => round($attendanceRate, 2),
                    'period' => [
                        'from' => $from->toDateString(),
                        'to' => $to->toDateString()
                    ]
                ]);
            } catch (YclientsApiException $e) {
                return response()->json([
                    'message' => 'Error fetching attendance from YCLIENTS'
                ], 502);
            }
        }
        
        return response()->json([
            'total_records' => 0,
            'attended_records' => 0,
            'attendance_rate' => 0
        ]);
    }
}