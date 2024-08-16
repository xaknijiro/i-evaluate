<?php

namespace App\Mail;

use App\Models\EvaluationScheduleSubjectClass;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Queue\SerializesModels;

class EvaluationCompleteNotification extends Mailable
{
    use Queueable, SerializesModels;

    private MailMessage $mailMessage;

    /**
     * Create a new message instance.
     */
    public function __construct(
        protected EvaluationScheduleSubjectClass $evaluationScheduleSubjectClass
    ) {
        $this->mailMessage = new MailMessage;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Evaluation Complete',
            tags: ['evaluation-complete-notification']
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $evaluationCode = $this->evaluationScheduleSubjectClass->code;
        $subjectClass = $this->evaluationScheduleSubjectClass->subjectClass;
        $subject = $this->evaluationScheduleSubjectClass->subjectClass->subject;
        $assignedTo = $this->evaluationScheduleSubjectClass->subjectClass->assignedTo;

        return new Content(
            htmlString: $this->mailMessage
                ->level('info')
                ->greeting('Thanks!')
                ->line('---')
                ->line('## Evaluation responses collected successfully.')
                ->lines([
                    '---',
                    "Evaluatee: ***{$assignedTo->name}***",
                    "Evaluation Code: ***{$evaluationCode}***",
                    "- Subject: {$subject->code} - {$subject->title}",
                    "- Course/Year: {$subjectClass->course->code} - {$subjectClass->year_level}",
                    "- A.Y./Semester: {$subjectClass->academic_year} - {$subjectClass->semester->title}",
                    '---',
                ])
                ->render()
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
