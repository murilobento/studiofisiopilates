import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateTimePickerProps {
  value?: string
  onChange?: (datetime: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  minDate?: Date
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Selecione data e hora",
  disabled = false,
  className,
  minDate
}: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  )
  const [time, setTime] = React.useState<string>(
    value ? format(new Date(value), "HH:mm") : ""
  )

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate && time) {
      const [hours, minutes] = time.split(':')
      selectedDate.setHours(parseInt(hours), parseInt(minutes))
      onChange?.(selectedDate.toISOString().slice(0, 16))
    }
  }

  const handleTimeChange = (newTime: string) => {
    setTime(newTime)
    if (date && newTime) {
      const [hours, minutes] = newTime.split(':')
      const newDate = new Date(date)
      newDate.setHours(parseInt(hours), parseInt(minutes))
      onChange?.(newDate.toISOString().slice(0, 16))
    }
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex-1 justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            initialFocus
            locale={ptBR}
            disabled={minDate ? { before: minDate } : undefined}
          />
        </PopoverContent>
      </Popover>

      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <Input
          type="time"
          value={time}
          onChange={(e) => handleTimeChange(e.target.value)}
          disabled={disabled}
          className="w-24"
        />
      </div>
    </div>
  )
} 