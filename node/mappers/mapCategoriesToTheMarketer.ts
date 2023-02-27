export const mapCategoriesToTheMarketer = (
  categoryList: CategoryTreeItem[],
  prevHierarchy: string | null,
  feed: TheMarketerFeedCategoryItem[] = []
) => {
  for (const categoryListItem of categoryList) {
    const item = {
      id: categoryListItem.id,
      name: categoryListItem.name,
      url: categoryListItem.url,
      hierarchy: prevHierarchy
        ? `${prevHierarchy}|${categoryListItem.name}`
        : categoryListItem.name,
    }

    feed.push(item)

    if (categoryListItem.hasChildren) {
      mapCategoriesToTheMarketer(
        categoryListItem.children,
        item.hierarchy,
        feed
      )
    }
  }

  return feed
}
