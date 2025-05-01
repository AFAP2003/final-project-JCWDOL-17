'use client'

import { useState, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
} from '@tanstack/react-table'
import { categoryManagementAPI } from '@/lib/apis/dashboard/categoryManagement.api'
import { useFormik } from 'formik'
import * as Yup from 'yup'

export function useCategoryManagement() {
  // Remote data & CRUD hooks
  const {
    categories,
    isLoading,
    fetchCategories,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
  } = categoryManagementAPI()

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 })
  const [pageCount, setPageCount] = useState(1)

  // Whenever pageIndex or pageSize changes, re-fetch
  useEffect(() => {
    async function load() {
      const json: any = await fetchCategories(pagination.pageIndex, pagination.pageSize)(pagination.pageIndex, pagination.pageSize)
      if (json?.pagination) {
        setPageCount(json.pagination.totalPages)
      }
    }
    load()
  }, [pagination.pageIndex, pagination.pageSize, fetchCategories])

  // Table instance with manual pagination
  const table = useReactTable({
    data: categories,
    manualPagination: true,
    pageCount,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // Formik for create / edit category
  const formik = useFormik({
    initialValues: { nama: '', deskripsi: '', isActive: true },
    validationSchema: Yup.object({
      nama: Yup.string().required('Nama wajib diisi'),
      deskripsi: Yup.string().max(255, 'Maksimal 255 karakter').required(),
    }),
    onSubmit: async (values, { resetForm }) => {
      let success = false
      if (formik.values.id) {
        success = await handleUpdateCategory(formik.values.id, values)
      } else {
        success = await handleCreateCategory(values)
      }
      if (success) resetForm()
    },
  })

  return {
    // data & loading
    categories,
    isLoading,
    // pagination & table
    table,
    pagination,
    pageCount,
    setPagination,
    // form
    formik,
    // CRUD
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
  }
}
