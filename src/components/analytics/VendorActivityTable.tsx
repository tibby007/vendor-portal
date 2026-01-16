'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface VendorActivity {
  id: string
  company_name: string
  total_deals: number
  active_deals: number
  funded_deals: number
  total_volume: number
  last_activity: string | null
}

interface VendorActivityTableProps {
  vendors: VendorActivity[]
  title?: string
  description?: string
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'No activity'
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function VendorActivityTable({
  vendors,
  title = 'Vendor Activity',
  description = 'Recent activity from your vendors',
}: VendorActivityTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {vendors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="text-center py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Deals
                  </th>
                  <th className="text-center py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="text-center py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funded
                  </th>
                  <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume
                  </th>
                  <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                            {getInitials(vendor.company_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-gray-900 text-sm">
                          {vendor.company_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="text-sm text-gray-900">
                        {vendor.total_deals}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      {vendor.active_deals > 0 ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {vendor.active_deals}
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {vendor.funded_deals > 0 ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {vendor.funded_deals}
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(vendor.total_volume)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="text-sm text-gray-500">
                        {formatDate(vendor.last_activity)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No vendor activity to display
          </div>
        )}
      </CardContent>
    </Card>
  )
}
