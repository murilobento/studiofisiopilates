import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Link } from "@inertiajs/react"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export type Student = {
  id: number
  name: string
  email: string
  phone: string | null
  plan: { description: string }
  custom_price: number | null
  status: string
  cpf: string | null
  city: string | null
  birth_date: string | null
  age?: number | null
}

export const columns = (onDelete: (studentId: number) => void): ColumnDef<Student>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    enableColumnFilter: true,
    enableGlobalFilter: true,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Telefone
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return row.getValue("phone") || "Não informado"
    },
    enableColumnFilter: true,
    enableGlobalFilter: true,
  },
  {
    accessorKey: "age",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Idade
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      // Prioriza a idade já calculada no backend
      const age = row.getValue("age") as number | null

      if (age !== null && age !== undefined) {
        return `${age} anos`
      }

      // Fallback: calcular idade no cliente caso não tenha vindo do backend
      const birthDate = row.original.birth_date
      if (!birthDate) return "Não informado"

      const today = new Date()
      const birth = new Date(birthDate)
      let calcAge = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        calcAge -= 1
      }

      return `${calcAge} anos`
    },
    enableColumnFilter: true,
    enableGlobalFilter: true,
  },
  {
    accessorKey: "plan.description",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Plano
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return row.original.plan?.description || "Não informado"
    },
    enableColumnFilter: true,
    enableGlobalFilter: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge 
          variant={status === 'ativo' ? 'secondary' : 'destructive'}
          className={status === 'ativo' ? 'bg-green-100 text-green-800 border-green-200' : ''}
        >
          {status === 'ativo' ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
    enableColumnFilter: true,
    enableGlobalFilter: true,
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const student = row.original

      return (
        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={route('students.edit', student.id)}>
                <Button variant="ghost" size="sm" className="flex items-center">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Editar aluno</p>
            </TooltipContent>
          </Tooltip>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center text-red-600 hover:text-red-900">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser desfeita. Isso excluirá permanentemente o aluno.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                    console.log('Deletando aluno:', student.id);
                    onDelete(student.id);
                }}>Continuar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )
    },
  },
]
