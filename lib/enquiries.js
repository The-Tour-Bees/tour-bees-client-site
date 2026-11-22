export class EnquiryStorageUnavailable extends Error {}

// TODO(database): store in the `enquiries` collection (see master_plan.md section 9)
// and email the team. Until MongoDB is connected this reports storage as unavailable
// so the forms never claim an enquiry was sent when it was not.
export async function saveEnquiry() {
  throw new EnquiryStorageUnavailable("Enquiry storage is not connected yet");
}
