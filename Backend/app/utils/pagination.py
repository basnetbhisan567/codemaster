def paginate(query, page: int = 1, limit: int = 20):
    offset = (page - 1) * limit
    return query.offset(offset).limit(limit)

def paginated_response(items, total, page, limit):
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "has_more": (page * limit) < total,
    }
