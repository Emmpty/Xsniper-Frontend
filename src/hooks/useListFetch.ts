import { ref, reactive, Ref, watch, computed } from 'vue'
import type { AxiosResponse } from 'axios'
import { debounce } from 'lodash-es'

export interface IFrisBaseResponse {
  message: string
  code: number
  [propsName: string]: any
}

export interface IFrisListResponse<T> extends IFrisBaseResponse {
  page: {
    curPageSize: number
    pageNum: number
    pageSize: number
    totalPages: number
    total: number
    list: T[]
  }
  result: any
  [propsName: string]: any
}
export interface IFrisUseListFetchParams {
  limit?: number
  pageNum?: number
  pageSize: number
  [propName: string]: any
}

export default function useListFetch<T>(
  action: (params: any) => Promise<IFrisBaseResponse>,
  params: IFrisUseListFetchParams
) {
  const total = ref<number | undefined>(undefined)
  const isLoading = ref(false)
  const list = ref([]) as Ref<T[]>
  params = reactive(params)
  const getList = debounce(async () => {
    try {
      isLoading.value = true
      const { result } = await action(params)
      if (result.records) {
        list.value = result.records
        total.value = result.total
      } else if (result.page) {
        list.value = result.page.list
        total.value = result.page.total
      } else if (result) {
        list.value = result
        total.value = result.length
      }
    } catch (err) {
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }, 300)

  watch(params, () => getList(), { deep: true })

  const pageChangeHandle = (page: number) => {
    params.pageNum = page
  }
  const pagSizeChangeHandle = (pageSize: number) => {
    params.pageSize = pageSize
  }

  const paginationProps = computed(() => ({
    pageSize: params.pageSize || params.limit,
    total: total.value,
    currentPage: params.pageNum,
  }))
  // const timer = ref()

  // watch(params.timing, (newV,oldV) => {
  //   if(newV) {
  //     timer.value = setInterval(() => {
  //       getList()
  //     }, 5000)
  //   } else {

  //   }
  // }, { deep: true })


  return {
    params,
    total,
    isLoading,
    list,
    getList,
    pageChangeHandle,
    pagSizeChangeHandle,
    paginationProps,
  }
}
