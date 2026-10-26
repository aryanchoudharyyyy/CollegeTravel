package com.CollegeTravel.Group_service.dto.Response;

import java.util.List;

public record GroupMembersResponse(long memberCount, List<String> memberNames, int page, int size, int totalPages, boolean hasNext) {
}
