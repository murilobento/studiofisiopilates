import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Paintbrush } from "lucide-react"

interface ColorPickerProps {
  value?: string
  onChange?: (color: string) => void
  className?: string
  disabled?: boolean
}

const presetColors = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
]

export function ColorPicker({ value = "#3b82f6", onChange, className, disabled }: ColorPickerProps) {
  const [color, setColor] = React.useState(value)

  React.useEffect(() => {
    setColor(value)
  }, [value])

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    onChange?.(newColor)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-[220px] justify-start text-left font-normal", className)}
          disabled={disabled}
        >
          <div className="w-full flex items-center gap-2">
            <div
              className="h-4 w-4 rounded !bg-center !bg-cover transition-all"
              style={{ backgroundColor: color }}
            />
            <div className="truncate flex-1">
              {color}
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="flex flex-wrap gap-1 mt-0">
          {presetColors.map((presetColor) => (
            <div
              key={presetColor}
              className={cn(
                "rounded-md h-6 w-6 cursor-pointer active:scale-105 border border-gray-300",
                color === presetColor && "ring-2 ring-gray-400"
              )}
              style={{ backgroundColor: presetColor }}
              onClick={() => handleColorChange(presetColor)}
            />
          ))}
        </div>
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <Paintbrush className="h-4 w-4" />
            <span className="text-sm font-medium">Cor personalizada</span>
          </div>
          <Input
            id="custom"
            value={color}
            className="col-span-2 h-8 mt-2"
            onChange={(e) => handleColorChange(e.currentTarget.value)}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}