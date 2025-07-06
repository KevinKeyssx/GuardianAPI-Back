export interface CloudinaryUploadResponse {
    asset_id            : string;
    public_id           : string;
    version             : number;
    version_id          : string;
    format              : string;
    resource_type       : string;
    type                : string;
    created_at          : string;
    bytes               : number;
    url                 : string;
    secure_url          : string;
    folder              : string;
    etag                : string;
    status              : string | null;
    access_mode         : string | null;
    access_control      : any | null;
    width               : number;
    height              : number;
    aspect_ratio        : number | null;
    pixels              : number | null;
    original_filename   : string;
    api_key             : string;
}
