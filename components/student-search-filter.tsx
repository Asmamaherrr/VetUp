'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search } from 'lucide-react'
import { Profile } from '@/lib/types'

interface StudentSearchFilterProps {
  students: Profile[]
}

export function StudentSearchFilter({ students }: StudentSearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="h-5 w-5 text-muted-foreground absolute mt-3 ml-3" />
            <Input
              placeholder="Search students by name or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            {filteredStudents.length} Result{filteredStudents.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
