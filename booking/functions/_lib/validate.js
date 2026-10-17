import { isValidIsoDate } from './dates.js';

export const SUPPORT_TYPES = {
  carpenter_mate: "Carpenter's mate / carpentry support",
  joinery: 'Joinery support',
  refurb: 'Refurbishment support',
  fitout: 'Fit-out support',
  other: "Other / let's discuss",
};

export const DURATIONS = {
  '1_day': '1 day',
  few_days: 'A few days',
  '1_week': '1 week',
  longer: 'Longer',
  not_sure: 'Not sure',
};

export const MATERIALS = {
  supplied_on_site: 'Supplied on site',
  collection_requested: "CDCS to collect (invoiced at cost)",
  discuss: 'To discuss with CDCS',
};

const MAX_LENS = {
  contact_name: 120, company_name: 160, contact_email: 200, contact_mobile: 30,
  site_postcode: 12, site_address: 300, work_description: 1000, site_contact: 160,
  access_details: 500, tools_ppe_needed: 300, po_reference: 100, req_start_time: 5,
};

function clean(v, max) {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UK_MOBILE_LOOSE_RE = /^[+0-9()\s-]{7,30}$/;
const POSTCODE_LOOSE_RE = /^[A-Za-z0-9 ]{2,10}$/;

export function validateBookingPayload(body) {
  const errors = {};
  const out = {};

  out.req_mode = ['date', 'flexible', 'asap'].includes(body.req_mode) ? body.req_mode : null;
  if (!out.req_mode) errors.req_mode = 'Choose when you need me.';

  out.req_start_date = null;
  if (out.req_mode === 'date') {
    if (!isValidIsoDate(body.req_start_date)) errors.req_start_date = 'Enter a valid start date.';
    else out.req_start_date = body.req_start_date;
  }

  out.req_duration = DURATIONS[body.req_duration] ? body.req_duration : null;
  if (!out.req_duration) errors.req_duration = 'Choose how long you need support for.';

  out.req_end_date = null;
  if (body.req_end_date) {
    if (!isValidIsoDate(body.req_end_date)) errors.req_end_date = 'End date looks wrong.';
    else out.req_end_date = body.req_end_date;
  }

  out.req_weekends_included = body.req_weekends_included ? 1 : 0;
  out.req_start_time = body.req_start_time === 'tba' ? 'tba' : clean(body.req_start_time, 5) || 'tba';

  out.site_postcode = clean(body.site_postcode, MAX_LENS.site_postcode).toUpperCase();
  if (!out.site_postcode || !POSTCODE_LOOSE_RE.test(out.site_postcode)) {
    errors.site_postcode = 'Enter the site postcode.';
  }
  out.site_address = clean(body.site_address, MAX_LENS.site_address);

  out.support_type = SUPPORT_TYPES[body.support_type] ? body.support_type : null;
  if (!out.support_type) errors.support_type = 'Choose the type of support needed.';

  out.work_description = clean(body.work_description, MAX_LENS.work_description);
  if (!out.work_description) errors.work_description = 'Add a short description of the job.';

  out.contact_name = clean(body.contact_name, MAX_LENS.contact_name);
  if (!out.contact_name) errors.contact_name = 'Enter your name.';

  out.company_name = clean(body.company_name, MAX_LENS.company_name);

  out.contact_email = clean(body.contact_email, MAX_LENS.contact_email);
  if (!EMAIL_RE.test(out.contact_email)) errors.contact_email = 'Enter a valid email address.';

  out.contact_mobile = clean(body.contact_mobile, MAX_LENS.contact_mobile);
  if (!UK_MOBILE_LOOSE_RE.test(out.contact_mobile)) errors.contact_mobile = 'Enter a valid mobile number.';

  out.site_contact = clean(body.site_contact, MAX_LENS.site_contact);
  out.access_details = clean(body.access_details, MAX_LENS.access_details);
  out.tools_ppe_needed = clean(body.tools_ppe_needed, MAX_LENS.tools_ppe_needed);
  out.materials_arrangement = MATERIALS[body.materials_arrangement] ? body.materials_arrangement : null;
  out.po_reference = clean(body.po_reference, MAX_LENS.po_reference);

  // Honeypot: a hidden field real users never fill in.
  if (body.website_hp) errors._bot = 'spam';

  return { errors, value: out, ok: Object.keys(errors).length === 0 };
}

export function whenLabel(b) {
  if (b.req_mode === 'asap') return 'As soon as possible';
  if (b.req_mode === 'flexible') return 'Dates flexible';
  return b.req_start_date || '';
}
