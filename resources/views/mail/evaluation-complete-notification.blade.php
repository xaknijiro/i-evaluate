<p>Thanks!</p>
<p>Your evaluation responses collected successfully.</p>

<p>
    {{ $evaluateeName }}<br/>
    Evaluation Code: <strong>{{ $evaluationCode }}</strong>
</p>
<table border="1" style="border-collapse: collapse;">
    <tr>
        <th align="left">Subject:</th>
        <td>{{ $subject }}</td>
    </tr>
    <tr>
        <th align="left">Course/Year:</th>
        <td>{{ $course }} - {{ $yearLevel }}</td>
    </tr>
    <tr>
        <th align="left">A.Y./Semester:</th>
        <td>{{ $academicYear }} {{$semester}}</td>
    </tr>
</table>