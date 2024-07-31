<?php

namespace App\Mail;

use App\Models\EvaluationPasscode;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EvaluationPasscodeNotification extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        protected EvaluationPasscode $evaluationPasscode
    ) {
        //
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
            view: 'mail.evaluation-passcode-notification',
            with: [
                'evaluateeName' => $assignedTo->name,
                'evaluationCode' => $evaluationCode,
                'subject' => "$subject->code - $subject->title",
                'course' => $subjectClass->course->code,
                'yearLevel' => $subjectClass->year_level,
                'academicYear' => $subjectClass->academic_year,
                'semester' => $subjectClass->semester->title,
                'passcode' => $passcode,
            ]
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
