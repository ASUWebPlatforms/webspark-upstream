/**
 * @file
 * Message template overrides.
 *
 * This override was made necessary when updating to Drupal 10.3 due to changes
 * in BigPipe that revealed a pre-existing issue with AJAX message theming.
 * See https://www.drupal.org/project/drupal/issues/3456176#comment-15692107.
 */

((Drupal) => {
  /**
   * Overrides message theme function.
   *
   * @param {object} message
   *   The message object.
   * @param {string} message.text
   *   The message text.
   * @param {object} options
   *   The message context.
   * @param {string} options.type
   *   The message type.
   * @param {string} options.id
   *   ID of the message, for reference.
   *
   * @return {HTMLElement}
   *   A DOM Node.
   */
  Drupal.theme.message = ({ text }, { type, id }) => {
    const messagesTypes = Drupal.Message.getMessageTypeLabels();
    const messageWrapper = document.createElement('div');

    let icon = '';
    let bs_class = '';
    switch(type) {
      case 'success':
      case 'status':
        icon = 'fa-check-circle';
        bs_class = 'alert-success';
        break;
      case 'warning':
        icon = 'fa-bell';
        bs_class = 'alert-warning';
        break;
      case 'information':
        icon = 'fa-info';
        bs_class = 'alert-info';
        break;
      case 'error':
      case 'danger':
        icon = 'fa-exclamation-triangle';
        bs_class = 'alert-danger';
        break;
      default:
        icon = 'fa-bug';
    }

    messageWrapper.setAttribute(
      'class',
      `${bs_class} alert alert-dismissible`,
    );
    messageWrapper.setAttribute(
      'role',
      type === 'error' || type === 'warning' ? 'alert' : 'status',
    );
    messageWrapper.setAttribute('aria-labelledby', `${id}-title`);
    messageWrapper.setAttribute('data-drupal-message-id', id);
    messageWrapper.setAttribute('data-drupal-message-type', type);

    messageWrapper.innerHTML = `
      <div class="messages__header">
        <h2 id="${id}-title" class="messages__title visually-hidden">
             ${messagesTypes[type]}
        </h2>
      </div>
      <div class="alert-icon">
        <span title="Alert" class="fa fa-icon ${icon}"></span>
      </div>
      <div class="alert-content">
          ${text}
      </div>
      <div class="alert-close">
        <button type="button"
                class="btn btn-circle btn-circle-alt-black close"
                data-bs-dismiss="alert" aria-label="Close">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
    `;
    return messageWrapper;
  };
})(Drupal);
