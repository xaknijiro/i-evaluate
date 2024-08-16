<?php

namespace App\Mail;

use App\Models\EvaluationPasscode;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Queue\SerializesModels;

class EvaluationPasscodeNotification extends Mailable
{
    use Queueable, SerializesModels;

    private MailMessage $mailMessage;

    /**
     * Create a new message instance.
     */
    public function __construct(
        protected EvaluationPasscode $evaluationPasscode
    ) {
        $this->mailMessage = new MailMessage;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Evaluation Passcode',
            tags: ['evaluation-passcode-notification']
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $evaluationCode = $this->evaluationPasscode->evaluationScheduleSubjectClass->code;
        $subjectClass = $this->evaluationPasscode->evaluationScheduleSubjectClass->subjectClass;
        $subject = $this->evaluationPasscode->evaluationScheduleSubjectClass->subjectClass->subject;
        $assignedTo = $this->evaluationPasscode->evaluationScheduleSubjectClass->subjectClass->assignedTo;
        $passcode = $this->evaluationPasscode->code;

        return new Content(
            htmlString: $this->mailMessage
                ->level('info')
                ->greeting('Greetings!')
                ->line('---')
                ->line("## Your evaluation passcode is: *{$passcode}*")
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
