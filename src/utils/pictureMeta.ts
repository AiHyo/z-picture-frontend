const TEMP_CATEGORY_PATTERNS = [/^回归分类\d+$/]
const TEMP_TAG_PATTERNS = [/^回归标签\d+$/]

type SelectOption = {
  value: string
  label: string
}

const sanitizeMetaList = (values: string[] = [], excludePatterns: RegExp[] = []) => {
  const seen = new Set<string>()
  return values
    .map((value) => value.trim())
    .filter((value) => {
      if (!value || seen.has(value)) {
        return false
      }
      if (excludePatterns.some((pattern) => pattern.test(value))) {
        return false
      }
      seen.add(value)
      return true
    })
}

const toSelectOptions = (values: string[]): SelectOption[] =>
  values.map((value) => ({
    value,
    label: value,
  }))

export const buildPictureMetaOptions = (data?: API.PictureTagCategory) => {
  const tagList = sanitizeMetaList(data?.tagList ?? [], TEMP_TAG_PATTERNS)
  const categoryList = sanitizeMetaList(data?.categoryList ?? [], TEMP_CATEGORY_PATTERNS)

  return {
    tagList,
    categoryList,
    tagOptions: toSelectOptions(tagList),
    categoryOptions: toSelectOptions(categoryList),
  }
}
