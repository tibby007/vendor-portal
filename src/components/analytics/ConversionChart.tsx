'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface ConversionStage {
  name: string
  count: number
  percentage: number
}

interface ConversionChartProps {
  stages: ConversionStage[]
  title?: string
  description?: string
}

export function ConversionChart({
  stages,
  title = 'Pipeline Conversion',
  description = 'Conversion rates through deal stages',
}: ConversionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {stages.map((stage, index) => (
            <div key={stage.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-medium flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {stage.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">
                    {stage.count}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({stage.percentage}%)
                  </span>
                </div>
              </div>
              <Progress value={stage.percentage} className="h-2" />
            </div>
          ))}
        </div>

        {stages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No conversion data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}
