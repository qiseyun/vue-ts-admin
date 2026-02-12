import uploadService from '@/utils/upload_files_request.ts'

export function uploadFile(data: FormData) {
  return uploadService.post<any>('/file/upload/qiniu', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
