export const TABLE_HEADERS = ['Name', 'Content Type', 'Slug', 'Status', 'Revalidate']

export const FORM_VALIDATION_MESSAGES = {
  END_POINT: {
    EMPTY: 'Please enter a valid URL.',
    INVALID: 'Please enter a valid URL starting with http:// or https://.',
  },
  PAGE_TEMPLATES: {
    EMPTY: 'Please select at least one content model that represents a page template.',
  },
}

export const FORM_VALIDATION = {
  END_POINT: /^(http|https).*[^\/]$/i,
}

export const NOTIFICATION_MESSAGES = {
  CONFIGURATION_SCREEN: {
    SUBMIT_FAILED:
      'There was an error saving your configuration. Please check the endpoint and selected content models, then try again.',
  },
  PAGE: {
    ENTRY_DOESNT_EXIST: 'Oops! Something went wrong. Please refresh and try again later.',
    SLUG_DOESNT_EXIT: 'This entry cannot be revalidated because the slug field is missing.',
    REVALIDATION_FAILED:
      'Unable to revalidate the page. Ensure the page exists and try again. If the problem persists, reach out to the dev team.',
    NETWORK_ERROR: 'Something went wrong, Please try again later..!',
  },
}
