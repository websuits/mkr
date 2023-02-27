interface CategoryTreeItem {
  id: string
  name: string
  hasChildren: boolean
  url: string
  children: CategoryTreeItem[]
  Title: string
  MetaTagDescription: string
}

interface Brand {
  id: number
  name: string
  isActive: boolean
  title: string
  metaTagDescription: string
  imageUrl: string | null
}
