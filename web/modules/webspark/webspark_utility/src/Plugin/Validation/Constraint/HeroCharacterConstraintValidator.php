<?php

namespace Drupal\webspark_utility\Plugin\Validation\Constraint;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

/**
 * Validates the UniqueInteger constraint.
 */
class HeroCharacterConstraintValidator extends ConstraintValidator {

  /**
   * {@inheritdoc}
   */
  public function validate($items, Constraint $constraint) {
    foreach ($items as $item) {
      // Get the value and check length.
      if (($item->value)) {
        $length = strlen($item->value);
        if ($length > 300) {
          $remove = $length - 300;
          $this->context->addViolation($constraint->tooLong, ['%length' => $length, '%remove' => $remove]);
        }
      }

    }
  }

}
