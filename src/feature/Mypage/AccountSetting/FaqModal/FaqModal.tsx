import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import Modal from '@/shared/components/Modal';
import BaseInput from '@/shared/components/Input/BaseInput';
import Button from '@/shared/components/Button';

import { faqServiceClient } from '@/services/backend/faq.api';
import type { FaqModalProps } from './types';

import styles from './FaqModal.module.scss';

export default function FaqModal({ isOpen, onClose }: FaqModalProps) {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (submitting) return;
      setSubmitting(true);

      try {
        const name = nameRef.current?.value.trim();
        const email = emailRef.current?.value.trim();
        const message = messageRef.current?.value.trim();

        if (!name || !email || !message) {
          toast.error('모든 필드를 입력해주세요.');
          setSubmitting(false);
          return;
        }

        await faqServiceClient.postFaq({
          name,
          email,
          message,
        });
        toast.success('문의가 성공적으로 제출되었습니다.');
        onClose();
      } catch (err) {
        console.error(err);
        toast.error('오류가 발생했습니다. 다시 시도하세요.');
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, onClose]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="문의하기"
      description="궁금한 점이나 불편한 점을 남겨주시면 빠르게 답변드리겠습니다."
      innerClassName={styles['faq-modal']}
    >
      <form className={styles['faq-form']} onSubmit={handleSubmit}>
        <label className={styles['faq-form__label']}>
          이름
          <BaseInput type="text" ref={nameRef} required placeholder="이름을 입력하세요" />
        </label>
        <label className={styles['faq-form__label']}>
          이메일
          <BaseInput type="email" ref={emailRef} required placeholder="이메일을 입력하세요" />
        </label>
        <label className={styles['faq-form__label']}>
          문의 내용
          <textarea
            ref={messageRef}
            className={styles['faq-form__textarea']}
            required
            placeholder="문의하실 내용을 입력하세요"
            rows={5}
          />
        </label>
        <Button type="submit" disabled={submitting}>
          {submitting ? '제출 중...' : '문의 제출하기'}
        </Button>
      </form>
    </Modal>
  );
}
