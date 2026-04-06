declare namespace API {
  type ID = string

  type BaseResponseBoolean_ = {
    code?: number
    data?: boolean
    message?: string
  }

  type BaseResponseCreateOutPaintingTaskResponse_ = {
    code?: number
    data?: CreateOutPaintingTaskResponse
    message?: string
  }

  type BaseResponseGetOutPaintingTaskResponse_ = {
    code?: number
    data?: GetOutPaintingTaskResponse
    message?: string
  }

  type BaseResponseInt_ = {
    code?: number
    data?: number
    message?: string
  }

  type BaseResponseListImageSearchResult_ = {
    code?: number
    data?: ImageSearchResult[]
    message?: string
  }

  type BaseResponseListPictureVO_ = {
    code?: number
    data?: PictureVO[]
    message?: string
  }

  type BaseResponseListPictureCategoryVO_ = {
    code?: number
    data?: PictureCategoryVO[]
    message?: string
  }

  type BaseResponseListPictureTagVO_ = {
    code?: number
    data?: PictureTagVO[]
    message?: string
  }

  type BaseResponseListSpaceNoticeVO_ = {
    code?: number
    data?: SpaceNoticeVO[]
    message?: string
  }

  type BaseResponseListSpace_ = {
    code?: number
    data?: Space[]
    message?: string
  }

  type BaseResponseListSpaceCategoryAnalyzeResponse_ = {
    code?: number
    data?: SpaceCategoryAnalyzeResponse[]
    message?: string
  }

  type BaseResponseListSpaceLevel_ = {
    code?: number
    data?: SpaceLevel[]
    message?: string
  }

  type BaseResponseListSpaceSizeAnalyzeResponse_ = {
    code?: number
    data?: SpaceSizeAnalyzeResponse[]
    message?: string
  }

  type BaseResponseListSpaceTagAnalyzeResponse_ = {
    code?: number
    data?: SpaceTagAnalyzeResponse[]
    message?: string
  }

  type BaseResponseListSpaceUserAnalyzeResponse_ = {
    code?: number
    data?: SpaceUserAnalyzeResponse[]
    message?: string
  }

  type BaseResponseListSpaceUserVO_ = {
    code?: number
    data?: SpaceUserVO[]
    message?: string
  }

  type BaseResponseLoginUserVO_ = {
    code?: number
    data?: LoginUserVO
    message?: string
  }

  type BaseResponseLong_ = {
    code?: number
    data?: number
    message?: string
  }

  type BaseResponsePagePicture_ = {
    code?: number
    data?: PagePicture_
    message?: string
  }

  type BaseResponsePagePictureAiTaskVO_ = {
    code?: number
    data?: PagePictureAiTaskVO_
    message?: string
  }

  type BaseResponsePagePictureReportVO_ = {
    code?: number
    data?: PagePictureReportVO_
    message?: string
  }

  type BaseResponsePagePictureVO_ = {
    code?: number
    data?: PagePictureVO_
    message?: string
  }

  type BaseResponsePageSpace_ = {
    code?: number
    data?: PageSpace_
    message?: string
  }

  type BaseResponsePageSpaceVO_ = {
    code?: number
    data?: PageSpaceVO_
    message?: string
  }

  type BaseResponsePageSpaceInviteVO_ = {
    code?: number
    data?: PageSpaceInviteVO_
    message?: string
  }

  type BaseResponsePageUserVO_ = {
    code?: number
    data?: PageUserVO_
    message?: string
  }

  type BaseResponsePicture_ = {
    code?: number
    data?: Picture
    message?: string
  }

  type BaseResponsePictureTagCategory_ = {
    code?: number
    data?: PictureTagCategory
    message?: string
  }

  type BaseResponsePictureVO_ = {
    code?: number
    data?: PictureVO
    message?: string
  }

  type BaseResponseSpace_ = {
    code?: number
    data?: Space
    message?: string
  }

  type BaseResponseSpaceUsageAnalyzeResponse_ = {
    code?: number
    data?: SpaceUsageAnalyzeResponse
    message?: string
  }

  type BaseResponseSpaceUser_ = {
    code?: number
    data?: SpaceUser
    message?: string
  }

  type BaseResponseSpaceVO_ = {
    code?: number
    data?: SpaceVO
    message?: string
  }

  type BaseResponseString_ = {
    code?: number
    data?: string
    message?: string
  }

  type BaseResponseUser_ = {
    code?: number
    data?: User
    message?: string
  }

  type BaseResponseUserVO_ = {
    code?: number
    data?: UserVO
    message?: string
  }

  type CreateOutPaintingTaskResponse = {
    code?: string
    message?: string
    output?: Output
    requestId?: string
  }

  type CreatePictureOutPaintingTaskRequest = {
    parameters?: Parameters
    pictureId?: ID
  }

  type DeleteRequest = {
    id?: ID
  }

  type doLoginUsingPOSTParams = {
    /** password */
    password?: string
    /** username */
    username?: string
  }

  type GetOutPaintingTaskResponse = {
    output?: Output1
    requestId?: string
  }

  type getPictureByIdUsingGETParams = {
    /** id */
    id?: ID
  }

  type getPictureOutPaintingTaskUsingGETParams = {
    /** taskId */
    taskId?: string
  }

  type getPictureVOByIdUsingGETParams = {
    /** id */
    id?: ID
  }

  type getSpaceByIdUsingGETParams = {
    /** id */
    id?: ID
  }

  type getSpaceVOByIdUsingGETParams = {
    /** id */
    id?: ID
  }

  type getUserByIdUsingGETParams = {
    /** id */
    id?: ID
  }

  type getUserVOByIdUsingGETParams = {
    /** id */
    id?: ID
  }

  type ImageSearchResult = {
    fromUrl?: string
    thumbUrl?: string
  }

  type LoginUserVO = {
    createTime?: string
    id?: ID
    updateTime?: string
    userAccount?: string
    userAvatar?: string
    userName?: string
    userProfile?: string
    userRole?: string
  }

  type listPictureTagCategoryUsingGETParams = {
    /** spaceId */
    spaceId?: ID
  }

  type Output = {
    taskId?: string
    taskStatus?: string
  }

  type Output1 = {
    code?: string
    endTime?: string
    message?: string
    outputImageUrl?: string
    scheduledTime?: string
    submitTime?: string
    taskId?: string
    taskMetrics?: TaskMetrics
    taskStatus?: string
  }

  type PagePicture_ = {
    current?: number
    pages?: number
    records?: Picture[]
    size?: number
    total?: number
  }

  type PagePictureAiTaskVO_ = {
    current?: number
    pages?: number
    records?: PictureAiTaskVO[]
    size?: number
    total?: number
  }

  type PagePictureReportVO_ = {
    current?: number
    pages?: number
    records?: PictureReportVO[]
    size?: number
    total?: number
  }

  type PagePictureVO_ = {
    current?: number
    pages?: number
    records?: PictureVO[]
    size?: number
    total?: number
  }

  type PageSpace_ = {
    current?: number
    pages?: number
    records?: Space[]
    size?: number
    total?: number
  }

  type PageSpaceVO_ = {
    current?: number
    pages?: number
    records?: SpaceVO[]
    size?: number
    total?: number
  }

  type PageSpaceInviteVO_ = {
    current?: number
    pages?: number
    records?: SpaceInviteVO[]
    size?: number
    total?: number
  }

  type PageUserVO_ = {
    current?: number
    pages?: number
    records?: UserVO[]
    size?: number
    total?: number
  }

  type Parameters = {
    addWatermark?: boolean
    angle?: number
    bestQuality?: boolean
    bottomOffset?: number
    leftOffset?: number
    limitImageSize?: boolean
    outputRatio?: string
    rightOffset?: number
    topOffset?: number
    xScale?: number
    yScale?: number
  }

  type Picture = {
    category?: string
    createTime?: string
    editTime?: string
    id?: ID
    introduction?: string
    isDelete?: number
    name?: string
    originalUrl?: string
    picColor?: string
    picFormat?: string
    picHeight?: number
    picScale?: number
    picSize?: number
    picWidth?: number
    reviewMessage?: string
    reviewStatus?: number
    reviewTime?: string
    reviewerId?: ID
    spaceId?: ID
    tags?: string
    thumbnailUrl?: string
    updateTime?: string
    url?: string
    userId?: ID
  }

  type PictureAiTaskQueryRequest = {
    current?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    taskStatus?: number
  }

  type PictureAiTaskVO = {
    createTime?: string
    errorMessage?: string
    finishTime?: string
    id?: ID
    pictureId?: ID
    resultUrl?: string
    taskStatus?: number
    taskType?: string
    userId?: ID
  }

  type PictureCategoryAddRequest = {
    categoryName?: string
  }

  type PictureCategoryEditRequest = {
    categoryName?: string
    id?: ID
  }

  type PictureCategoryQueryRequest = {
    categoryName?: string
  }

  type PictureCategoryVO = {
    categoryName?: string
    id?: ID
  }

  type PictureEditByBatchRequest = {
    category?: string
    nameRule?: string
    pictureIdList?: ID[]
    spaceId?: ID
    tags?: string[]
  }

  type PictureEditRequest = {
    category?: string
    id?: ID
    introduction?: string
    name?: string
    tags?: string[]
  }

  type PictureQueryRequest = {
    category?: string
    current?: number
    endEditTime?: string
    id?: ID
    introduction?: string
    name?: string
    nullSpaceId?: boolean
    pageSize?: number
    picFormat?: string
    picHeight?: number
    picScale?: number
    picSize?: number
    picWidth?: number
    reviewMessage?: string
    reviewStatus?: number
    reviewerId?: ID
    searchText?: string
    sortField?: string
    sortOrder?: string
    spaceId?: ID
    startEditTime?: string
    tags?: string[]
    userId?: ID
  }

  type PictureReviewRequest = {
    id?: ID
    reviewMessage?: string
    reviewStatus?: number
  }

  type PictureReportAddRequest = {
    pictureId?: ID
    reportReasonText?: string
    reportReasonType?: string
  }

  type PictureReportProcessRequest = {
    id?: ID
    processResult?: string
    reportStatus?: number
  }

  type PictureReportQueryRequest = {
    current?: number
    pageSize?: number
    pictureId?: ID
    reportStatus?: number
    sortField?: string
    sortOrder?: string
  }

  type PictureReportVO = {
    createTime?: string
    id?: ID
    pictureId?: ID
    processResult?: string
    processTime?: string
    reportReasonText?: string
    reportReasonType?: string
    reportStatus?: number
    reporter?: UserVO
    reporterId?: ID
  }

  type PictureTagAddRequest = {
    tagName?: string
  }

  type PictureTagEditRequest = {
    id?: ID
    tagName?: string
  }

  type PictureTagQueryRequest = {
    tagName?: string
  }

  type PictureTagCategory = {
    categoryList?: string[]
    tagList?: string[]
  }

  type PictureTagVO = {
    id?: ID
    tagName?: string
  }

  type PictureUpdateRequest = {
    category?: string
    id?: ID
    introduction?: string
    name?: string
    tags?: string[]
  }

  type PictureUploadByBatchRequest = {
    category?: string
    count?: number
    namePrefix?: string
    searchText?: string
    tags?: string[]
  }

  type PictureUploadRequest = {
    fileUrl?: string
    id?: ID
    picName?: string
    spaceId?: ID
  }

  type PictureVO = {
    category?: string
    createTime?: string
    editTime?: string
    id?: ID
    introduction?: string
    name?: string
    permissionList?: string[]
    picColor?: string
    picFormat?: string
    picHeight?: number
    picScale?: number
    picSize?: number
    picWidth?: number
    reviewMessage?: string
    reviewStatus?: number
    spaceId?: ID
    tags?: string[]
    thumbnailUrl?: string
    updateTime?: string
    url?: string
    user?: UserVO
    userId?: ID
  }

  type SearchPictureByColorRequest = {
    picColor?: string
    spaceId?: ID
  }

  type SearchPictureByPictureRequest = {
    pictureId?: ID
  }

  type Space = {
    createTime?: string
    editTime?: string
    id?: ID
    isDelete?: number
    maxCount?: number
    maxSize?: number
    spaceLevel?: number
    spaceName?: string
    spaceType?: number
    totalCount?: number
    totalSize?: number
    updateTime?: string
    userId?: ID
  }

  type SpaceAddRequest = {
    spaceLevel?: number
    spaceName?: string
    spaceType?: number
  }

  type SpaceCategoryAnalyzeRequest = {
    queryAll?: boolean
    queryPublic?: boolean
    spaceId?: ID
  }

  type SpaceCategoryAnalyzeResponse = {
    category?: string
    count?: number
    totalSize?: number
  }

  type SpaceEditRequest = {
    id?: ID
    spaceName?: string
  }

  type SpaceLevel = {
    maxCount?: number
    maxSize?: number
    text?: string
    value?: number
  }

  type SpaceQueryRequest = {
    current?: number
    id?: ID
    pageSize?: number
    sortField?: string
    sortOrder?: string
    spaceLevel?: number
    spaceName?: string
    spaceType?: number
    userId?: ID
  }

  type SpaceRankAnalyzeRequest = {
    topN?: number
  }

  type SpaceSizeAnalyzeRequest = {
    queryAll?: boolean
    queryPublic?: boolean
    spaceId?: ID
  }

  type SpaceSizeAnalyzeResponse = {
    count?: number
    sizeRange?: string
  }

  type SpaceTagAnalyzeRequest = {
    queryAll?: boolean
    queryPublic?: boolean
    spaceId?: ID
  }

  type SpaceTagAnalyzeResponse = {
    count?: number
    tag?: string
  }

  type SpaceUpdateRequest = {
    id?: ID
    maxCount?: number
    maxSize?: number
    spaceLevel?: number
    spaceName?: string
  }

  type SpaceUsageAnalyzeRequest = {
    queryAll?: boolean
    queryPublic?: boolean
    spaceId?: ID
  }

  type SpaceUsageAnalyzeResponse = {
    countUsageRatio?: number
    maxCount?: number
    maxSize?: number
    sizeUsageRatio?: number
    usedCount?: number
    usedSize?: number
  }

  type SpaceUser = {
    createTime?: string
    id?: ID
    spaceId?: ID
    spaceRole?: string
    updateTime?: string
    userId?: ID
  }

  type SpaceInviteAddRequest = {
    inviteMessage?: string
    inviteeId?: ID
    spaceId?: ID
    spaceRole?: string
  }

  type SpaceInviteHandleRequest = {
    id?: ID
  }

  type SpaceInviteQueryRequest = {
    current?: number
    inviteStatus?: number
    inviteeId?: ID
    pageSize?: number
    sortField?: string
    sortOrder?: string
    spaceId?: ID
  }

  type SpaceInviteVO = {
    createTime?: string
    handleTime?: string
    id?: ID
    inviteMessage?: string
    inviteStatus?: number
    invitee?: UserVO
    inviteeId?: ID
    inviter?: UserVO
    inviterId?: ID
    spaceId?: ID
    spaceRole?: string
    updateTime?: string
  }

  type SpaceNoticeAddRequest = {
    content?: string
    isPinned?: number
    spaceId?: ID
    title?: string
  }

  type SpaceNoticeEditRequest = {
    content?: string
    id?: ID
    isPinned?: number
    spaceId?: ID
    title?: string
  }

  type SpaceNoticeQueryRequest = {
    spaceId?: ID
  }

  type SpaceNoticeVO = {
    content?: string
    createTime?: string
    id?: ID
    isPinned?: number
    spaceId?: ID
    title?: string
    updateTime?: string
    user?: UserVO
    userId?: ID
  }

  type SpaceUserAddRequest = {
    spaceId?: ID
    spaceRole?: string
    userId?: ID
  }

  type SpaceUserAnalyzeRequest = {
    queryAll?: boolean
    queryPublic?: boolean
    spaceId?: ID
    timeDimension?: string
    userId?: ID
  }

  type SpaceUserAnalyzeResponse = {
    count?: number
    period?: string
  }

  type SpaceUserEditRequest = {
    id?: ID
    spaceRole?: string
  }

  type SpaceUserQueryRequest = {
    id?: ID
    spaceId?: ID
    spaceRole?: string
    userId?: ID
  }

  type SpaceUserVO = {
    createTime?: string
    id?: ID
    space?: SpaceVO
    spaceId?: ID
    spaceRole?: string
    updateTime?: string
    user?: UserVO
    userId?: ID
  }

  type SpaceVO = {
    createTime?: string
    editTime?: string
    id?: ID
    maxCount?: number
    maxSize?: number
    permissionList?: string[]
    spaceLevel?: number
    spaceName?: string
    spaceType?: number
    totalCount?: number
    totalSize?: number
    updateTime?: string
    user?: UserVO
    userId?: ID
  }

  type TaskMetrics = {
    failed?: number
    succeeded?: number
    total?: number
  }

  type testDownloadFileUsingGETParams = {
    /** filepath */
    filepath?: string
  }

  type uploadPictureUsingPOSTParams = {
    fileUrl?: string
    id?: ID
    picName?: string
    spaceId?: ID
  }

  type User = {
    createTime?: string
    editTime?: string
    id?: ID
    isDelete?: number
    updateTime?: string
    userAccount?: string
    userAvatar?: string
    userName?: string
    userPassword?: string
    userProfile?: string
    userRole?: string
    vipCode?: string
    vipExpireTime?: string
    vipNumber?: string
  }

  type UserAddRequest = {
    userAccount?: string
    userAvatar?: string
    userName?: string
    userProfile?: string
    userRole?: string
  }

  type UserLoginRequest = {
    userAccount?: string
    userPassword?: string
  }

  type UserQueryRequest = {
    current?: number
    id?: ID
    pageSize?: number
    sortField?: string
    sortOrder?: string
    userAccount?: string
    userName?: string
    userProfile?: string
    userRole?: string
  }

  type UserRegisterRequest = {
    checkPassword?: string
    userAccount?: string
    userPassword?: string
  }

  type UserUpdateRequest = {
    id?: ID
    userAvatar?: string
    userName?: string
    userProfile?: string
    userRole?: string
  }

  type UserVO = {
    createTime?: string
    id?: ID
    userAccount?: string
    userAvatar?: string
    userName?: string
    userProfile?: string
    userRole?: string
    vipCode?: string
    vipExpireTime?: string
    vipNumber?: string
  }

  type VipExchangeRequest = {
    vipCode?: string
  }
}
