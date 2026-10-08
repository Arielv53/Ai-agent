/** Resize versioned Cloudinary uploads; leave external/signed URLs untouched. */
export function feedImageUrl(uri: string, width: number): string {
  const match = uri.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/.*)$/);
  return match ? `${match[1]}c_limit,w_${width},q_auto,f_auto/${match[2]}` : uri;
}
