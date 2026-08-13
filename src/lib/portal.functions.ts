import { createServerFn } from "@tanstack/react-start";

export const loadPortal = createServerFn({ method: "POST" })
  .inputValidator(async (data: unknown) => {
    const { portalCredentials } = await import("./portal.server");
    return portalCredentials.parse(data);
  })
  .handler(async ({ data }) => {
    const { loadPortalDossier } = await import("./portal.server");
    return loadPortalDossier(data);
  });


export const uploadPortalPhoto = createServerFn({ method: "POST" })
  .inputValidator(async (data: unknown) => {
    const { portalPhotoInput } = await import("./portal.server");
    return portalPhotoInput.parse(data);
  })
  .handler(async ({ data }) => {
    const { savePortalPhoto } = await import("./portal.server");
    return savePortalPhoto(data);
  });
