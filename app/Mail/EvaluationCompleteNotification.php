<?php

namespace App\Mail;

use App\Models\EvaluationPasscode;
use App\Models\EvaluationScheduleSubjectClass;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EvaluationCompleteNotification extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        protected EvaluationScheduleSubjectClass $evaluationScheduleSubjectClass
    ) {
        //
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
            view: 'mail.evaluation-complete-notification',
            with: [
                'evaluateeName' => $assignedTo->name,
                'evaluationCode' => $evaluationCode,
                'subject' => "$subject->code - $subject->title",
                'course' => $subjectClass->course->code,
                'yearLevel' => $subjectClass->year_level,
                'academicYear' => $subjectClass->academic_year,
                'semester' => $subjectClass->semester->title,
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
